import { Aircraft, ReadsbAircraft, ReadsbResponse } from './types';
import { Airport, RunwayEnd } from '../../data/airports/types';
import { calculateBearing, haversineDistanceNm } from '../../utils/aviationMath';
import { decodeIcaoCountry } from '../../utils/icaoCountry';
import { decodeAirlineName } from '../../utils/airlineDecoder';

export class AdsbService {
  private prevAircraftMap: Map<string, Aircraft> = new Map();

  public clearCache() {
    this.prevAircraftMap.clear();
  }

  public async fetchTraffic(
    mode: 'live' | 'adsbx',
    airport: Airport,
    activeRunway: RunwayEnd | undefined,
    rapidApiKey?: string,
    radiusNm: number = 50
  ): Promise<Aircraft[]> {
    let rawList: ReadsbAircraft[] = [];

    if (mode === 'adsbx' && rapidApiKey) {
      try {
        const res = await fetch(
          `/api/traffic/adsbx?lat=${airport.lat}&lon=${airport.lon}&radius=${radiusNm}`,
          {
            headers: {
              'x-rapidapi-key': rapidApiKey,
            },
          }
        );
        if (res.ok) {
          const data: ReadsbResponse = await res.json();
          rawList = data.ac || data.aircraft || [];
        }
      } catch (e) {
        console.warn('Failed to fetch from ADSBx proxy:', e);
      }
    } else {
      // Default: Live Free Feed via local proxy
      try {
        const proxyRes = await fetch(
          `/api/traffic/live?lat=${airport.lat}&lon=${airport.lon}&radius=${radiusNm}`
        );
        if (proxyRes.ok) {
          const data: ReadsbResponse = await proxyRes.json();
          rawList = data.ac || data.aircraft || [];
        } else {
          throw new Error('Proxy status ' + proxyRes.status);
        }
      } catch (proxyErr) {
        // Direct browser fallback (opendata.adsb.fi or airplanes.live)
        try {
          const directRes = await fetch(
            `https://opendata.adsb.fi/api/v2/lat/${airport.lat}/lon/${airport.lon}/dist/${radiusNm}`
          );
          if (directRes.ok) {
            const data: ReadsbResponse = await directRes.json();
            rawList = data.ac || data.aircraft || [];
          }
        } catch (directErr) {
          console.warn('Live ADS-B feed unavailable:', directErr);
        }
      }
    }

    return this.processAircraft(rawList, airport, activeRunway);
  }

  private processAircraft(
    rawList: ReadsbAircraft[],
    airport: Airport,
    activeRunway: RunwayEnd | undefined
  ): Aircraft[] {
    const now = Date.now();
    const thresholdCoord = activeRunway?.threshold || { lat: airport.lat, lon: airport.lon };

    for (const raw of rawList) {
      if (raw.lat === undefined || raw.lon === undefined) continue;

      const hex = (raw.hex || '').trim().toUpperCase();
      if (!hex) continue;

      const altBaro = raw.alt_baro === 'ground' ? 0 : (typeof raw.alt_baro === 'number' ? raw.alt_baro : 0);
      const isGround = raw.alt_baro === 'ground';
      const groundSpeed = raw.gs || 0;
      const track = raw.track || 0;
      const baroRate = raw.baro_rate || 0;
      const squawk = raw.squawk || '----';

      // Clean flight callsign (strip trailing spaces)
      const flight = (raw.flight || raw.r || hex).trim();
      const registration = (raw.r || hex).trim();
      const type = (raw.t || 'AIRC').trim();
      const { country, flag, code: countryCode } = decodeIcaoCountry(hex);
      const desc = raw.desc || (raw.t ? `${raw.t} Aircraft` : 'Standard Aircraft');
      const operator = decodeAirlineName(flight, raw.ownOp);

      // Retrieve previous state for history dots
      const prev = this.prevAircraftMap.get(hex);
      let history = prev ? [...prev.history] : [];

      // Add a history point if moved noticeably (> 0.05 NM or ~100m) or if first time
      const lastPt = history[history.length - 1];
      const distFromLast = lastPt ? haversineDistanceNm(lastPt.lat, lastPt.lon, raw.lat, raw.lon) : 999;
      if (!lastPt || distFromLast >= 0.05) {
        history.push({
          lat: raw.lat,
          lon: raw.lon,
          altitudeFt: altBaro,
          timestamp: now,
        });
        if (history.length > 5) {
          history = history.slice(history.length - 5);
        }
      }

      // Calculations relative to active runway threshold and airport ARP
      const distToThreshold = haversineDistanceNm(
        thresholdCoord.lat,
        thresholdCoord.lon,
        raw.lat,
        raw.lon
      );
      const bearingFromThreshold = calculateBearing(
        thresholdCoord.lat,
        thresholdCoord.lon,
        raw.lat,
        raw.lon
      );
      const distToArp = haversineDistanceNm(airport.lat, airport.lon, raw.lat, raw.lon);
      const bearingFromArp = calculateBearing(airport.lat, airport.lon, raw.lat, raw.lon);

      const ac: Aircraft = {
        hex,
        flight,
        registration,
        type,
        desc,
        operator,
        country,
        flag,
        countryCode,
        lat: raw.lat,
        lon: raw.lon,
        altitudeFt: altBaro,
        isGround,
        altitudeGeomFt: raw.alt_geom,
        groundSpeedKts: groundSpeed,
        iasKts: raw.ias,
        tasKts: raw.tas,
        mach: raw.mach,
        trackDeg: track,
        magHeading: raw.mag_heading,
        trueHeading: raw.true_heading,
        rollDeg: raw.roll,
        baroRateFpm: baroRate,
        geomRateFpm: raw.geom_rate,
        squawk,
        category: raw.category,
        emergency: raw.emergency,
        navAltitudeMcp: raw.nav_altitude_mcp,
        navHeading: raw.nav_heading,
        navModes: raw.nav_modes,
        navQnh: raw.nav_qnh,
        nic: raw.nic,
        rc: raw.rc,
        nac_p: raw.nac_p,
        sil: raw.sil,
        seen: raw.seen ?? 0,
        seenPos: raw.seen_pos,
        rssi: raw.rssi,
        messages: raw.messages,
        lastSeen: now,
        history,
        distanceToThresholdNm: distToThreshold,
        bearingFromThresholdDeg: bearingFromThreshold,
        distanceToArpNm: distToArp,
        bearingFromArpDeg: bearingFromArp,
        isSimulated: false,
      };

      this.prevAircraftMap.set(hex, ac);
    }

    // Prune stale aircraft not seen for > 25 seconds
    const cutoff = now - 25000;
    for (const [k, v] of this.prevAircraftMap.entries()) {
      if (v.lastSeen < cutoff) {
        this.prevAircraftMap.delete(k);
      }
    }

    // Return active tracks from map
    return Array.from(this.prevAircraftMap.values());
  }
}

export const adsbService = new AdsbService();
