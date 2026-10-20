import { toRad } from '../../utils/aviationMath';

export interface TafForecast {
  fcstTimeFrom?: number;
  fcstTimeTo?: number;
  change?: string;
  probability?: number;
  wdir?: number | 'VRB';
  wspd?: number;
  visib?: string | number;
  wxString?: string;
  clouds?: { cover: string; base: number; type?: string }[];
}

export interface TafData {
  icao: string;
  rawTAF: string;
  issueTime?: string;
  validTimeFrom?: number | null;
  validTimeTo?: number | null;
  remarks?: string;
  fcsts?: TafForecast[];
}

export interface MetarData {
  icao: string;
  raw: string;
  time?: string;
  tempC?: number | null;
  dewpC?: number | null;
  windDir?: number | 'VRB' | null;
  windSpeedKt?: number | null;
  windGustKt?: number | null;
  altimHpa?: number | null;
  visSm?: string | number | null;
  cover?: string;
  flightRules?: 'VFR' | 'MVFR' | 'IFR' | 'LIFR';
  clouds?: { cover: string; base: number }[];
  isSimulated?: boolean;
  taf?: TafData | null;
}

export class MetarService {
  private cache: Map<string, { data: MetarData; timestamp: number }> = new Map();

  public async fetchMetar(icao: string): Promise<MetarData> {
    const cleanIcao = icao.toUpperCase().trim();
    const now = Date.now();
    const cached = this.cache.get(cleanIcao);

    if (cached && now - cached.timestamp < 3 * 60 * 1000) {
      return cached.data;
    }

    try {
      const res = await fetch(`/api/metar?icao=${cleanIcao}`);
      if (res.ok) {
        const data: MetarData = await res.json();
        this.cache.set(cleanIcao, { data, timestamp: now });
        return data;
      }
    } catch (e) {
      console.warn('Failed to fetch METAR from proxy:', e);
    }

    // Direct Aviation Weather API fallback
    try {
      const direct = await fetch(`https://aviationweather.gov/api/data/metar?ids=${cleanIcao}&format=json`);
      if (direct.ok) {
        const items = await direct.json();
        if (Array.isArray(items) && items.length > 0) {
          const item = items[0];
          const taf = await this.fetchTaf(cleanIcao).catch(() => null);
          const data: MetarData = {
            icao: cleanIcao,
            raw: item.rawOb || '',
            time: item.reportTime || '',
            tempC: item.temp,
            dewpC: item.dewp,
            windDir: item.wdir,
            windSpeedKt: item.wspd,
            windGustKt: item.wgst,
            altimHpa: item.altim ? (item.altim > 500 ? Math.round(item.altim) : Math.round(item.altim * 33.8639)) : 1013,
            visSm: item.visib,
            flightRules: item.fltcat || 'VFR',
            clouds: item.clouds || [],
            taf,
          };
          this.cache.set(cleanIcao, { data, timestamp: now });
          return data;
        }
      }
    } catch (e) {
      console.warn('Direct METAR fetch failed:', e);
    }

    // Default fallback
    const fallback: MetarData = {
      icao: cleanIcao,
      raw: `${cleanIcao} 191630Z AUTO 26008KT 9999 FEW030 18/12 Q1018 NOSIG`,
      windDir: 260,
      windSpeedKt: 8,
      tempC: 18,
      dewpC: 12,
      altimHpa: 1018,
      flightRules: 'VFR',
    };
    return fallback;
  }

  public async fetchTaf(icao: string): Promise<TafData | null> {
    const cleanIcao = icao.toUpperCase().trim();
    try {
      const res = await fetch(`/api/taf?icao=${cleanIcao}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      // Graceful
    }

    try {
      const direct = await fetch(`https://aviationweather.gov/api/data/taf?ids=${cleanIcao}&format=json`);
      if (direct.ok) {
        const items = await direct.json();
        if (Array.isArray(items) && items.length > 0) {
          const item = items[0];
          return {
            icao: cleanIcao,
            rawTAF: item.rawTAF || '',
            issueTime: item.issueTime || '',
            validTimeFrom: item.validTimeFrom || null,
            validTimeTo: item.validTimeTo || null,
            remarks: item.remarks || '',
            fcsts: item.fcsts || [],
          };
        }
      }
    } catch (e) {
      // Graceful
    }

    return null;
  }

  /**
   * Calculates headwind and crosswind components relative to runway heading
   */
  public calculateWindComponents(
    windDir: number | 'VRB' | null | undefined,
    windSpeedKt: number | null | undefined,
    runwayHeadingDeg: number
  ): { headwindKt: number; crosswindKt: number; crosswindSide: 'L' | 'R' } {
    if (windDir === null || windDir === undefined || windDir === 'VRB' || !windSpeedKt) {
      return { headwindKt: 0, crosswindKt: 0, crosswindSide: 'R' };
    }

    const angleDiffRad = toRad(windDir - runwayHeadingDeg);
    const headwindKt = Math.round(windSpeedKt * Math.cos(angleDiffRad));
    const crosswindVal = Math.round(windSpeedKt * Math.sin(angleDiffRad));
    const crosswindKt = Math.abs(crosswindVal);
    const crosswindSide = crosswindVal > 0 ? 'R' : 'L';

    return { headwindKt, crosswindKt, crosswindSide };
  }
}

export const metarService = new MetarService();
