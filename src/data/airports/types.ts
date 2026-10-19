export interface RunwayEnd {
  id: string; // e.g. "02"
  heading: number; // magnetic/true heading in degrees (e.g. 22)
  threshold: { lat: number; lon: number };
  elevationFt?: number;
  ilsFrequency?: string;
  ilsIdent?: string;
}

export interface Runway {
  id: string; // e.g. "02/20"
  lengthMeters: number;
  widthMeters: number;
  end1: RunwayEnd;
  end2: RunwayEnd;
}

export interface Airport {
  icao: string;
  iata?: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
  elevationFt: number;
  transitionAltitudeFt: number;
  runways: Runway[];
  defaultActiveRunway: string; // e.g. "02"
}
