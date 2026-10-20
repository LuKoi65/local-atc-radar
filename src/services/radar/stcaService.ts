import { Aircraft } from '../adsb/types';
import { haversineDistanceNm, toRad } from '../../utils/aviationMath';

export type StcaLevel = 'caution' | 'warning';

export interface StcaConflict {
  id: string; // unique pair id: e.g. "HEX1_HEX2" sorted
  ac1: Aircraft;
  ac2: Aircraft;
  level: StcaLevel;
  currentDistNm: number;
  currentAltDiffFt: number;
  timeToCpaMin: number | null;
  distAtCpaNm: number | null;
  altDiffAtCpaFt: number | null;
  detectedAt: number;
  isMuted?: boolean;
}

/**
 * Evaluates real-time aircraft separation and predictive trajectory convergence
 * according to ICAO / EUROCONTROL STCA specifications.
 */
export function detectStcaConflicts(
  aircraftList: Aircraft[],
  mutedConflictIds: string[] = []
): {
  conflicts: StcaConflict[];
  conflictHexMap: Map<string, StcaLevel>;
} {
  const conflicts: StcaConflict[] = [];
  const conflictHexMap = new Map<string, StcaLevel>();
  const mutedSet = new Set(mutedConflictIds);

  // Only consider active airborne aircraft with valid coordinates and speed
  const airborne = aircraftList.filter(
    (ac) =>
      !ac.isGround &&
      typeof ac.lat === 'number' &&
      typeof ac.lon === 'number' &&
      typeof ac.altitudeFt === 'number' &&
      ac.altitudeFt > 250 && // exclude aircraft on the runway or immediate rollout
      ac.groundSpeedKts > 35
  );

  const n = airborne.length;
  if (n < 2) {
    return { conflicts, conflictHexMap };
  }

  const now = Date.now();

  for (let i = 0; i < n; i++) {
    const a1 = airborne[i];

    for (let j = i + 1; j < n; j++) {
      const a2 = airborne[j];

      // Vertical separation filter (quick check)
      const currentAltDiff = Math.abs(a1.altitudeFt - a2.altitudeFt);
      if (currentAltDiff > 2500) {
        continue; // Too far vertically
      }

      // Horizontal separation (NM)
      const currentDist = haversineDistanceNm(a1.lat, a1.lon, a2.lat, a2.lon);
      if (currentDist > 14) {
        continue; // Too far horizontally
      }

      // Velocity vectors in NM/min
      const speed1 = a1.groundSpeedKts / 60; // NM/min
      const speed2 = a2.groundSpeedKts / 60;
      const track1Rad = toRad(a1.trackDeg);
      const track2Rad = toRad(a2.trackDeg);

      const vx1 = speed1 * Math.sin(track1Rad);
      const vy1 = speed1 * Math.cos(track1Rad);
      const vx2 = speed2 * Math.sin(track2Rad);
      const vy2 = speed2 * Math.cos(track2Rad);

      // Relative position vector from a1 to a2 in NM
      const midLat = toRad((a1.lat + a2.lat) / 2);
      const dx = (a2.lon - a1.lon) * 60 * Math.cos(midLat);
      const dy = (a2.lat - a1.lat) * 60;

      // Relative velocity vector (a2 relative to a1)
      const dvx = vx2 - vx1;
      const dvy = vy2 - vy1;
      const relSpeedSq = dvx * dvx + dvy * dvy;

      let timeToCpaMin: number | null = null;
      let distAtCpaNm: number | null = null;
      let altDiffAtCpaFt: number | null = null;

      if (relSpeedSq > 0.0001) {
        // Time to Closest Point of Approach (in minutes)
        const tCpa = -(dx * dvx + dy * dvy) / relSpeedSq;
        if (tCpa > 0 && tCpa <= 3.0) {
          timeToCpaMin = tCpa;
          const cpaX = dx + dvx * tCpa;
          const cpaY = dy + dvy * tCpa;
          distAtCpaNm = Math.sqrt(cpaX * cpaX + cpaY * cpaY);

          // Vertical extrapolation at CPA
          const r1 = a1.baroRateFpm || 0;
          const r2 = a2.baroRateFpm || 0;
          const alt1Cpa = a1.altitudeFt + r1 * tCpa;
          const alt2Cpa = a2.altitudeFt + r2 * tCpa;
          altDiffAtCpaFt = Math.abs(alt1Cpa - alt2Cpa);
        }
      }

      // Determine STCA Conflict Level:
      let level: StcaLevel | null = null;

      // 1. WARNING: Imminent or present loss of standard separation (< 5 NM and < 1000 ft)
      if (currentDist < 5.0 && currentAltDiff < 1000) {
        level = 'warning';
      } else if (
        timeToCpaMin !== null &&
        timeToCpaMin <= 2.0 &&
        distAtCpaNm !== null &&
        distAtCpaNm < 3.5 &&
        altDiffAtCpaFt !== null &&
        altDiffAtCpaFt < 850
      ) {
        level = 'warning';
      }
      // 2. CAUTION: Trajectory closure / proximity (< 8 NM and < 1500 ft)
      else if (
        currentDist < 8.0 &&
        currentAltDiff < 1500 &&
        (timeToCpaMin !== null || currentDist < 6.0)
      ) {
        level = 'caution';
      } else if (
        timeToCpaMin !== null &&
        timeToCpaMin <= 2.5 &&
        distAtCpaNm !== null &&
        distAtCpaNm < 5.0 &&
        altDiffAtCpaFt !== null &&
        altDiffAtCpaFt < 1100
      ) {
        level = 'caution';
      }

      if (level) {
        const sortedHexes = [a1.hex, a2.hex].sort();
        const conflictId = `${sortedHexes[0]}_${sortedHexes[1]}`;
        const isMuted = mutedSet.has(conflictId);

        conflicts.push({
          id: conflictId,
          ac1: a1,
          ac2: a2,
          level,
          currentDistNm: currentDist,
          currentAltDiffFt: currentAltDiff,
          timeToCpaMin,
          distAtCpaNm,
          altDiffAtCpaFt,
          detectedAt: now,
          isMuted,
        });

        // Register in visual map only if alert is not manually muted
        if (!isMuted) {
          const current1 = conflictHexMap.get(a1.hex);
          if (!current1 || level === 'warning') conflictHexMap.set(a1.hex, level);

          const current2 = conflictHexMap.get(a2.hex);
          if (!current2 || level === 'warning') conflictHexMap.set(a2.hex, level);
        }
      }
    }
  }

  return { conflicts, conflictHexMap };
}
