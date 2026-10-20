/**
 * Aviation Navigation and Geodetic Mathematics Utilities
 * STARS / Eurocontrol ATC scope projection and calculations.
 */

export const EARTH_RADIUS_NM = 3440.065;
export const EARTH_RADIUS_M = 6371000;
export const NM_TO_METERS = 1852;
export const METERS_TO_NM = 1 / 1852;
export const FEET_TO_METERS = 0.3048;

/**
 * Degrees to Radians
 */
export function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Radians to Degrees
 */
export function toDeg(rad: number): number {
  return ((rad * 180) / Math.PI + 360) % 360;
}

/**
 * Normalizes an angle to 0 - 360 degrees
 */
export function normalizeBearing(deg: number): number {
  const b = deg % 360;
  return b < 0 ? b + 360 : b;
}

/**
 * Haversine distance in Nautical Miles between two coordinates
 */
export function haversineDistanceNm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const rLat1 = toRad(lat1);
  const rLat2 = toRad(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rLat1) * Math.cos(rLat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_NM * c;
}

/**
 * Initial Great Circle Bearing (0 - 360 degrees) from point 1 to point 2
 */
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δλ = toRad(lon2 - lon1);

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  const θ = Math.atan2(y, x);
  return normalizeBearing(toDeg(θ));
}

/**
 * Great circle destination point given start point, initial bearing (deg), and distance (NM)
 */
export function destinationPoint(
  lat: number,
  lon: number,
  bearingDeg: number,
  distanceNm: number
): { lat: number; lon: number } {
  const δ = distanceNm / EARTH_RADIUS_NM; // angular distance in radians
  const θ = toRad(bearingDeg);
  const φ1 = toRad(lat);
  const λ1 = toRad(lon);

  const φ2 = Math.asin(
    Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ)
  );
  const λ2 =
    λ1 +
    Math.atan2(
      Math.sin(θ) * Math.sin(δ) * Math.cos(φ1),
      Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2)
    );

  return {
    lat: (φ2 * 180) / Math.PI,
    lon: ((((λ2 * 180) / Math.PI + 540) % 360) - 180), // normalize to -180..+180
  };
}

/**
 * Destination point using distance in meters
 */
export function destinationPointMeters(
  lat: number,
  lon: number,
  bearingDeg: number,
  distanceMeters: number
): { lat: number; lon: number } {
  return destinationPoint(lat, lon, bearingDeg, distanceMeters * METERS_TO_NM);
}

/**
 * Speed leader line endpoint based on Ground Speed (kts), track (deg), and duration (minutes)
 */
export function calculateSpeedVectorEnd(
  lat: number,
  lon: number,
  trackDeg: number,
  gsKts: number,
  minutes: number
): { lat: number; lon: number; distanceNm: number } {
  const speed = Math.max(0, gsKts || 0);
  const distanceNm = (speed * minutes) / 60;
  if (distanceNm <= 0.01) {
    return { lat, lon, distanceNm: 0 };
  }
  const end = destinationPoint(lat, lon, trackDeg, distanceNm);
  return { ...end, distanceNm };
}

/**
 * Physical Runway polygon corners [p1, p2, p3, p4] in [lat, lon]
 * threshold1 is the landing threshold for runway 1, runway extends along heading1 for lengthMeters
 */
export function calculateRunwayPolygon(
  threshold1Lat: number,
  threshold1Lon: number,
  headingDeg: number,
  lengthMeters: number,
  widthMeters: number = 45
): [number, number][] {
  const halfWidth = widthMeters / 2;
  const perpBearingLeft = normalizeBearing(headingDeg - 90);
  const perpBearingRight = normalizeBearing(headingDeg + 90);

  // Threshold 1 left & right corners
  const t1L = destinationPointMeters(threshold1Lat, threshold1Lon, perpBearingLeft, halfWidth);
  const t1R = destinationPointMeters(threshold1Lat, threshold1Lon, perpBearingRight, halfWidth);

  // Threshold 2 (far end)
  const farEnd = destinationPointMeters(threshold1Lat, threshold1Lon, headingDeg, lengthMeters);
  const t2R = destinationPointMeters(farEnd.lat, farEnd.lon, perpBearingRight, halfWidth);
  const t2L = destinationPointMeters(farEnd.lat, farEnd.lon, perpBearingLeft, halfWidth);

  return [
    [t1L.lat, t1L.lon],
    [t1R.lat, t1R.lon],
    [t2R.lat, t2R.lon],
    [t2L.lat, t2L.lon],
  ];
}

export interface ApproachTick {
  center: [number, number];
  start: [number, number];
  end: [number, number];
  distanceNm: number;
  isMajor: boolean; // 5, 10, 15 NM
}

/**
 * Extended approach centerline points and perpendicular graduation ticks
 * Centerline extends backward along reciprocal heading from the landing threshold.
 */
export function calculateApproachCenterline(
  thresholdLat: number,
  thresholdLon: number,
  runwayHeadingDeg: number,
  maxDistanceNm: number = 15
): {
  centerline: [number, number][];
  ticks: ApproachTick[];
  farEndpoint: [number, number];
} {
  const approachBearing = normalizeBearing(runwayHeadingDeg + 180); // Reciprocal heading
  const perp1 = normalizeBearing(approachBearing + 90);
  const perp2 = normalizeBearing(approachBearing - 90);

  const centerline: [number, number][] = [[thresholdLat, thresholdLon]];
  const ticks: ApproachTick[] = [];

  for (let d = 1; d <= maxDistanceNm; d += 1) {
    const pt = destinationPoint(thresholdLat, thresholdLon, approachBearing, d);
    centerline.push([pt.lat, pt.lon]);

    const isMajor = d % 5 === 0;
    const tickHalfLengthNm = isMajor ? 0.4 : 0.15; // 5 NM ticks are longer

    const tStart = destinationPoint(pt.lat, pt.lon, perp1, tickHalfLengthNm);
    const tEnd = destinationPoint(pt.lat, pt.lon, perp2, tickHalfLengthNm);

    ticks.push({
      center: [pt.lat, pt.lon],
      start: [tStart.lat, tStart.lon],
      end: [tEnd.lat, tEnd.lon],
      distanceNm: d,
      isMajor,
    });
  }

  const farPt = destinationPoint(thresholdLat, thresholdLon, approachBearing, maxDistanceNm);

  return {
    centerline,
    ticks,
    farEndpoint: [farPt.lat, farPt.lon],
  };
}

/**
 * Calculates ILS Localizer Feather / Cone polygon coordinates
 * Standard ILS cone has ~3.0° half-width extending out e.g. 10 to 15 NM
 */
export function calculateLocalizerFeather(
  thresholdLat: number,
  thresholdLon: number,
  runwayHeadingDeg: number,
  lengthNm: number = 10,
  halfAngleDeg: number = 3.5
): [number, number][] {
  const approachBearing = normalizeBearing(runwayHeadingDeg + 180);
  const leftBearing = normalizeBearing(approachBearing - halfAngleDeg);
  const rightBearing = normalizeBearing(approachBearing + halfAngleDeg);

  const pFarLeft = destinationPoint(thresholdLat, thresholdLon, leftBearing, lengthNm);
  const pFarCenter = destinationPoint(thresholdLat, thresholdLon, approachBearing, lengthNm);
  const pFarRight = destinationPoint(thresholdLat, thresholdLon, rightBearing, lengthNm);

  return [
    [thresholdLat, thresholdLon],
    [pFarLeft.lat, pFarLeft.lon],
    [pFarCenter.lat, pFarCenter.lon],
    [pFarRight.lat, pFarRight.lon],
  ];
}

/**
 * Format Altitude for ATC Data Block
 * Below transition altitude (e.g. 5000 ft): hundreds of feet (e.g. 4500 -> "045", 500 -> "005")
 * Above transition altitude: Flight Level (e.g. 18000 -> "FL180", 9500 -> "FL095")
 */
export function formatAltitude(
  altFt: number | string | null | undefined,
  transitionAlt: number = 5000
): string {
  if (altFt === null || altFt === undefined || altFt === 'ground') {
    return 'GND';
  }
  const alt = typeof altFt === 'number' ? altFt : parseInt(altFt, 10);
  if (isNaN(alt)) return '---';

  if (alt >= transitionAlt) {
    const fl = Math.round(alt / 100);
    return `FL${fl.toString().padStart(3, '0')}`;
  } else {
    const hundreds = Math.round(alt / 100);
    return hundreds.toString().padStart(3, '0');
  }
}

/**
 * Format Vertical Trend indicator:
 * Climb: ↑ (> +200 fpm)
 * Descent: ↓ (< -200 fpm)
 * Level: - (-200..+200 fpm)
 */
export function formatVerticalTrend(baroRate: number | null | undefined): {
  symbol: string;
  label: 'CLB' | 'DES' | 'LVL';
} {
  if (baroRate === null || baroRate === undefined || isNaN(baroRate)) {
    return { symbol: '-', label: 'LVL' };
  }
  if (baroRate > 200) {
    return { symbol: '↑', label: 'CLB' };
  } else if (baroRate < -200) {
    return { symbol: '↓', label: 'DES' };
  }
  return { symbol: '-', label: 'LVL' };
}

/**
 * Format Ground Speed (e.g. 162 kts -> "162" or STARS "16")
 */
export function formatSpeed(gs: number | null | undefined): string {
  if (gs === null || gs === undefined || isNaN(gs)) return '---';
  return Math.round(gs).toString().padStart(3, '0');
}

/**
 * Squawk status analyzer
 */
export function inspectSquawk(squawk: string | null | undefined): {
  code: string;
  isEmergency: boolean;
  alertType?: 'EMERGENCY' | 'RADIO FAILURE' | 'HIJACK' | 'VFR';
} {
  const code = (squawk || '----').trim();
  if (code === '7700') {
    return { code, isEmergency: true, alertType: 'EMERGENCY' };
  }
  if (code === '7600') {
    return { code, isEmergency: true, alertType: 'RADIO FAILURE' };
  }
  if (code === '7500') {
    return { code, isEmergency: true, alertType: 'HIJACK' };
  }
  if (code === '7000' || code === '1200') {
    return { code, isEmergency: false, alertType: 'VFR' };
  }
  return { code, isEmergency: false };
}

/**
 * Format Bearing / Range / Altitude (BRA) display
 */
export function formatBra(
  bearingDeg: number,
  distanceNm: number,
  altitudeFt?: number | null
): string {
  const b = Math.round(normalizeBearing(bearingDeg))
    .toString()
    .padStart(3, '0');
  const d = distanceNm.toFixed(1);
  if (altitudeFt !== undefined && altitudeFt !== null) {
    const a = formatAltitude(altitudeFt);
    return `${b}° / ${d} NM / ${a}`;
  }
  return `${b}° / ${d} NM`;
}

/**
 * Interpolates intermediate great-circle coordinates between two lat/lon points
 * for accurate curvature and route drawing across large distances.
 * Preserves true geographic coordinate bounds (Lat: -90..+90, Lon: -180..+180).
 */
export function interpolateGreatCirclePoints(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  pointsCount: number = 20
): [number, number][] {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const rLat1 = toRad(lat1);
  const rLat2 = toRad(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rLat1) * Math.cos(rLat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const d = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  if (d < 0.0001 || pointsCount <= 1) {
    return [
      [lat1, lon1],
      [lat2, lon2],
    ];
  }

  const sinD = Math.sin(d);
  const points: [number, number][] = [];

  for (let i = 0; i <= pointsCount; i++) {
    const f = i / pointsCount;
    const aCoeff = Math.sin((1 - f) * d) / sinD;
    const bCoeff = Math.sin(f * d) / sinD;

    const x =
      aCoeff * Math.cos(rLat1) * Math.cos(toRad(lon1)) +
      bCoeff * Math.cos(rLat2) * Math.cos(toRad(lon2));
    const y =
      aCoeff * Math.cos(rLat1) * Math.sin(toRad(lon1)) +
      bCoeff * Math.cos(rLat2) * Math.sin(toRad(lon2));
    const z = aCoeff * Math.sin(rLat1) + bCoeff * Math.sin(rLat2);

    // Standard geographic degrees in [-90, +90] and [-180, +180]
    const latI = (Math.atan2(z, Math.sqrt(x * x + y * y)) * 180) / Math.PI;
    const lonI = (Math.atan2(y, x) * 180) / Math.PI;

    points.push([latI, lonI]);
  }

  // Force exact start and end coordinates to match endpoints without float drift
  points[0] = [lat1, lon1];
  points[points.length - 1] = [lat2, lon2];

  return points;
}

