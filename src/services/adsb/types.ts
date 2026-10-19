export interface ReadsbAircraft {
  hex: string;
  flight?: string;
  r?: string;
  t?: string;
  desc?: string;
  ownOp?: string;
  lat?: number;
  lon?: number;
  alt_baro?: number | 'ground';
  alt_geom?: number;
  gs?: number;
  ias?: number;
  tas?: number;
  mach?: number;
  track?: number;
  track_rate?: number;
  roll?: number;
  mag_heading?: number;
  true_heading?: number;
  baro_rate?: number;
  geom_rate?: number;
  squawk?: string;
  emergency?: string;
  category?: string;
  nav_altitude_mcp?: number;
  nav_heading?: number;
  nav_modes?: string[];
  nav_qnh?: number;
  nic?: number;
  rc?: number;
  nac_p?: number;
  sil?: number;
  seen?: number;
  seen_pos?: number;
  rssi?: number;
  messages?: number;
}

export interface ReadsbResponse {
  ac?: ReadsbAircraft[];
  aircraft?: ReadsbAircraft[];
  total?: number;
  resultCount?: number;
  now?: number;
  ctime?: number;
}

export interface AircraftHistoryPoint {
  lat: number;
  lon: number;
  altitudeFt: number;
  timestamp: number;
}

export interface Aircraft {
  hex: string;
  flight: string;
  registration: string;
  type: string;
  desc: string;
  operator: string;
  country: string;
  flag: string;
  countryCode: string;
  lat: number;
  lon: number;
  altitudeFt: number;
  isGround: boolean;
  altitudeGeomFt?: number;
  groundSpeedKts: number;
  iasKts?: number;
  tasKts?: number;
  mach?: number;
  trackDeg: number;
  magHeading?: number;
  trueHeading?: number;
  rollDeg?: number;
  baroRateFpm: number;
  geomRateFpm?: number;
  squawk: string;
  category?: string;
  emergency?: string;
  navAltitudeMcp?: number;
  navHeading?: number;
  navModes?: string[];
  navQnh?: number;
  nic?: number;
  rc?: number;
  nac_p?: number;
  sil?: number;
  seen: number;
  seenPos?: number;
  rssi?: number;
  messages?: number;
  lastSeen: number;
  history: AircraftHistoryPoint[];
  // Calculated relative to active runway threshold and ARP
  distanceToThresholdNm?: number;
  bearingFromThresholdDeg?: number;
  distanceToArpNm?: number;
  bearingFromArpDeg?: number;
  isSimulated?: boolean;
}
