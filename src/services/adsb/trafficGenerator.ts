import { ReadsbAircraft } from './types';
import { Airport, RunwayEnd } from '../../data/airports/types';
import { destinationPoint, normalizeBearing } from '../../utils/aviationMath';

interface SimAircraftState {
  hex: string;
  flight: string;
  r: string;
  t: string;
  lat: number;
  lon: number;
  alt_baro: number;
  gs: number;
  track: number;
  baro_rate: number;
  squawk: string;
  role: 'approach_final' | 'approach_base' | 'departing' | 'overflight_high' | 'overflight_mid' | 'ga_training';
  targetWaypoint?: { lat: number; lon: number };
}

export class TrafficSimulator {
  private aircraftList: SimAircraftState[] = [];
  private currentAirportIcao: string = '';
  private currentRunwayId: string = '';
  private lastTick: number = Date.now();

  constructor() {
    this.resetForAirport();
  }

  public resetForAirport(airport?: Airport, activeRunway?: RunwayEnd) {
    if (!airport) return;
    this.currentAirportIcao = airport.icao;
    this.currentRunwayId = activeRunway?.id || airport.defaultActiveRunway;

    const rwyHeading = activeRunway?.heading || 22;
    const thresh = activeRunway?.threshold || { lat: airport.lat, lon: airport.lon };
    const reciprocal = normalizeBearing(rwyHeading + 180);

    // Initial 6 aircraft with realistic profiles
    // 1. Inbound on Final ILS (11 NM out, 3200 ft, 150 kts)
    const finalPt = destinationPoint(thresh.lat, thresh.lon, reciprocal, 11);
    // 2. Base leg turn to final (8 NM lateral offset, 4000 ft, 190 kts)
    const baseOffsetPt = destinationPoint(finalPt.lat, finalPt.lon, normalizeBearing(rwyHeading - 85), 6);
    // 3. Departing aircraft just airborne (2 NM ahead on runway heading, climbing 2500 ft, 210 kts)
    const depPt = destinationPoint(thresh.lat, thresh.lon, rwyHeading, 3);
    // 4. Overflight high cruising east-west (FL360, 440 kts)
    const over1 = destinationPoint(airport.lat, airport.lon, 280, 18);
    // 5. Overflight descending across sector (FL240 descending at -1500 fpm, 320 kts)
    const over2 = destinationPoint(airport.lat, airport.lon, 45, 22);
    // 6. Light aircraft VFR in local sector (TBM 940, 3500 ft, 160 kts)
    const gaPt = destinationPoint(airport.lat, airport.lon, 160, 8);

    this.aircraftList = [
      {
        hex: '394A10',
        flight: 'AFR429',
        r: 'F-GKXU',
        t: 'A320',
        lat: finalPt.lat,
        lon: finalPt.lon,
        alt_baro: 3200,
        gs: 148,
        track: rwyHeading,
        baro_rate: -720,
        squawk: '4321',
        role: 'approach_final',
      },
      {
        hex: '4CA892',
        flight: 'RYR68P',
        r: 'EI-ENA',
        t: 'B738',
        lat: baseOffsetPt.lat,
        lon: baseOffsetPt.lon,
        alt_baro: 4200,
        gs: 195,
        track: normalizeBearing(rwyHeading + 80),
        baro_rate: -500,
        squawk: '5102',
        role: 'approach_base',
      },
      {
        hex: '39D2F1',
        flight: 'EJU184',
        r: 'F-HEPE',
        t: 'A20N',
        lat: depPt.lat,
        lon: depPt.lon,
        alt_baro: 2400,
        gs: 215,
        track: rwyHeading,
        baro_rate: 2200,
        squawk: '6245',
        role: 'departing',
      },
      {
        hex: '400A23',
        flight: 'BAW452',
        r: 'G-XWBA',
        t: 'A359',
        lat: over1.lat,
        lon: over1.lon,
        alt_baro: 36000,
        gs: 452,
        track: 110,
        baro_rate: 0,
        squawk: '1000',
        role: 'overflight_high',
      },
      {
        hex: '344891',
        flight: 'IBE310',
        r: 'EC-MUM',
        t: 'A321',
        lat: over2.lat,
        lon: over2.lon,
        alt_baro: 24000,
        gs: 340,
        track: 225,
        baro_rate: -1600,
        squawk: '2350',
        role: 'overflight_mid',
      },
      {
        hex: '38190B',
        flight: 'F-HREX',
        r: 'F-HREX',
        t: 'TBM9',
        lat: gaPt.lat,
        lon: gaPt.lon,
        alt_baro: 3500,
        gs: 162,
        track: normalizeBearing(rwyHeading - 140),
        baro_rate: 100,
        squawk: '7000',
        role: 'ga_training',
      },
    ];

    this.lastTick = Date.now();
  }

  public tick(airport: Airport, activeRunway?: RunwayEnd): ReadsbAircraft[] {
    const now = Date.now();
    const dtSeconds = Math.max(0.5, Math.min(5, (now - this.lastTick) / 1000));
    this.lastTick = now;

    const rwyHeading = activeRunway?.heading ?? 22;
    const thresh = activeRunway?.threshold ?? { lat: airport.lat, lon: airport.lon };
    const reciprocal = normalizeBearing(rwyHeading + 180);

    for (const ac of this.aircraftList) {
      // Calculate delta distance moved in NM
      const distNm = (ac.gs * dtSeconds) / 3600;
      const nextPos = destinationPoint(ac.lat, ac.lon, ac.track, distNm);
      ac.lat = nextPos.lat;
      ac.lon = nextPos.lon;

      // Update altitude based on baro_rate (ft/min)
      ac.alt_baro += Math.round((ac.baro_rate * dtSeconds) / 60);

      // Behavior rules for realism
      if (ac.role === 'approach_final') {
        // As it approaches runway, decelerate to 135 kts
        if (ac.alt_baro < 1500 && ac.gs > 135) {
          ac.gs -= 1 * dtSeconds;
        }
        // Once touchdown near threshold
        if (ac.alt_baro <= airport.elevationFt + 50) {
          // Respawn as new inbound approach 16 NM out
          const newStart = destinationPoint(thresh.lat, thresh.lon, reciprocal, 16);
          ac.lat = newStart.lat;
          ac.lon = newStart.lon;
          ac.alt_baro = 4500;
          ac.gs = 160;
          ac.track = rwyHeading;
          ac.baro_rate = -750;
        }
      } else if (ac.role === 'approach_base') {
        // Intercept localizer when crossing the extended centerline
        if (ac.track !== rwyHeading) {
          // Gradual standard rate turn (3 deg/sec)
          const angleDiff = ((rwyHeading - ac.track + 540) % 360) - 180;
          if (Math.abs(angleDiff) <= 4) {
            ac.track = rwyHeading;
            ac.baro_rate = -700;
          } else {
            ac.track = normalizeBearing(ac.track + Math.sign(angleDiff) * 3 * dtSeconds);
          }
        }
      } else if (ac.role === 'departing') {
        // Once climbing past FL120, respawn new departure
        if (ac.alt_baro >= 14000) {
          const freshDep = destinationPoint(thresh.lat, thresh.lon, rwyHeading, 0.5);
          ac.lat = freshDep.lat;
          ac.lon = freshDep.lon;
          ac.alt_baro = airport.elevationFt + 200;
          ac.gs = 160;
          ac.track = rwyHeading;
          ac.baro_rate = 2400;
        }
      } else if (ac.role === 'ga_training') {
        // Gentle circle / pattern turn
        ac.track = normalizeBearing(ac.track + 1.2 * dtSeconds);
      }
    }

    return this.aircraftList.map((ac) => {
      const mach = Number((ac.gs / 573).toFixed(2));
      const ias = Math.round(ac.gs * (ac.alt_baro > 10000 ? 0.75 : 0.95));
      const descs: Record<string, string> = {
        A320: 'Airbus A320-214',
        B738: 'Boeing 737-8AS WL',
        A20N: 'Airbus A320-251N NEO',
        A359: 'Airbus A350-941',
        A321: 'Airbus A321-231',
        TBM9: 'Daher TBM-940 Turboprop',
      };
      const ops: Record<string, string> = {
        AFR429: 'Air France',
        RYR68P: 'Ryanair',
        EJU184: 'easyJet Europe',
        BAW452: 'British Airways',
        IBE310: 'Iberia',
        'F-HREX': 'Private Owner',
      };

      return {
        hex: ac.hex,
        flight: ac.flight,
        r: ac.r,
        t: ac.t,
        desc: descs[ac.t] || `${ac.t} Aircraft`,
        ownOp: ops[ac.flight] || 'Airline Operator',
        lat: ac.lat,
        lon: ac.lon,
        alt_baro: ac.alt_baro,
        alt_geom: ac.alt_baro + 75,
        gs: Math.round(ac.gs),
        ias,
        tas: Math.round(ac.gs * 1.02),
        mach,
        track: Math.round(ac.track),
        baro_rate: Math.round(ac.baro_rate),
        geom_rate: Math.round(ac.baro_rate * 1.01),
        squawk: ac.squawk,
        category: ac.t === 'A359' ? 'A4' : ac.t === 'TBM9' ? 'A1' : 'A3',
        nav_altitude_mcp: ac.role === 'approach_final' ? 1200 : ac.role === 'departing' ? 18000 : ac.alt_baro,
        nav_heading: Math.round(ac.track),
        nav_modes: ['autopilot', 'vnav', 'lnav', 'tcas'],
        seen: 0,
        messages: 1420,
        rssi: -12.4,
      };
    });
  }
}
