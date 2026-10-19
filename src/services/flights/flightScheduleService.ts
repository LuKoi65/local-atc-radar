import { Aircraft } from '../adsb/types';

export interface AirportFlight {
  id: string;
  flightNumber: string;
  callsign: string;
  airline: string;
  city: string;
  airportCode: string;
  type: 'departure' | 'arrival';
  scheduledTime: string;
  estimatedTime?: string;
  date: string;
  status: string;
  statusType: 'landed' | 'departed' | 'on_time' | 'delayed' | 'boarding' | 'scheduled' | 'en_route' | 'cancelled';
  aircraftType: string;
  terminalGate?: string;

  // Corrélation avec le radar ADS-B en direct
  inRadar?: boolean;
  radarHex?: string;
  radarDistanceNm?: number;
  radarAltitudeFt?: number;
  radarSpeedKts?: number;
}

export interface AirportFidsResponse {
  icao: string;
  airportName: string;
  source: string;
  updatedAt: string;
  departures: AirportFlight[];
  arrivals: AirportFlight[];
}

class FlightScheduleService {
  private cache: Map<string, { time: number; data: AirportFidsResponse }> = new Map();
  private CACHE_TTL_MS = 60 * 1000; // 1 minute côté client

  public async fetchAirportFlights(icao: string): Promise<AirportFidsResponse> {
    const code = (icao || 'LFBT').toUpperCase().trim();
    const now = Date.now();
    const cached = this.cache.get(code);

    if (cached && now - cached.time < this.CACHE_TTL_MS) {
      return cached.data;
    }

    try {
      const response = await fetch(`/api/airport/flights?icao=${encodeURIComponent(code)}`);
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      const data: AirportFidsResponse = await response.json();
      this.cache.set(code, { time: now, data });
      return data;
    } catch (err) {
      console.warn(`[FlightScheduleService] Impossible de récupérer les vols pour ${code}:`, err);
      if (cached) return cached.data;
      throw err;
    }
  }

  /**
   * Corrèle les vols prévus ou arrivés avec la flotte d'aéronefs actuellement détectés par le radar ADS-B
   */
  public correlateWithLiveTraffic(flights: AirportFlight[], trafficList: Aircraft[]): AirportFlight[] {
    if (!flights || flights.length === 0 || !trafficList || trafficList.length === 0) {
      return flights;
    }

    return flights.map((flight) => {
      const cleanFn = flight.flightNumber.replace(/\s+/g, '').toUpperCase();
      const cleanCs = flight.callsign.replace(/\s+/g, '').toUpperCase();

      const matchedAc = trafficList.find((ac) => {
        const acFlight = ac.flight.replace(/\s+/g, '').toUpperCase();
        const acHex = ac.hex.replace(/\s+/g, '').toUpperCase();
        const acReg = ac.registration.replace(/\s+/g, '').toUpperCase();

        return (
          acFlight === cleanCs ||
          acFlight === cleanFn ||
          acFlight.includes(cleanFn) ||
          cleanCs.includes(acFlight) ||
          acReg === cleanFn ||
          acHex === cleanFn
        );
      });

      if (matchedAc) {
        return {
          ...flight,
          inRadar: true,
          radarHex: matchedAc.hex,
          radarDistanceNm: matchedAc.distanceToArpNm,
          radarAltitudeFt: matchedAc.altitudeFt,
          radarSpeedKts: matchedAc.groundSpeedKts,
        };
      }

      return {
        ...flight,
        inRadar: false,
      };
    });
  }
}

export const flightScheduleService = new FlightScheduleService();
