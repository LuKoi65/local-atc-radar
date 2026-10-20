import { AIRPORT_PRESETS } from './presets';

export interface AirportLocation {
  lat: number;
  lon: number;
  name: string;
  iata?: string;
  icao?: string;
}

/**
 * Fallback coordinate database for top European and international destinations
 * used when FlightAware returns IATA/ICAO without raw coordinates.
 */
export const AIRPORT_COORDINATES_MAP: Record<string, { lat: number; lon: number; name: string }> = {
  // France
  LFPG: { lat: 49.0097, lon: 2.5479, name: 'Paris Charles de Gaulle' },
  CDG: { lat: 49.0097, lon: 2.5479, name: 'Paris Charles de Gaulle' },
  LFPO: { lat: 48.7262, lon: 2.3656, name: 'Paris Orly' },
  ORY: { lat: 48.7262, lon: 2.3656, name: 'Paris Orly' },
  LFLL: { lat: 45.7256, lon: 5.0811, name: 'Lyon Saint-Exupéry' },
  LYS: { lat: 45.7256, lon: 5.0811, name: 'Lyon Saint-Exupéry' },
  LFML: { lat: 43.4367, lon: 5.2150, name: 'Marseille Provence' },
  MRS: { lat: 43.4367, lon: 5.2150, name: 'Marseille Provence' },
  LFMN: { lat: 43.6653, lon: 7.2150, name: 'Nice Côte d\'Azur' },
  NCE: { lat: 43.6653, lon: 7.2150, name: 'Nice Côte d\'Azur' },
  LFBO: { lat: 43.6291, lon: 1.3638, name: 'Toulouse Blagnac' },
  TLS: { lat: 43.6291, lon: 1.3638, name: 'Toulouse Blagnac' },
  LFBD: { lat: 44.8283, lon: -0.7156, name: 'Bordeaux Mérignac' },
  BOD: { lat: 44.8283, lon: -0.7156, name: 'Bordeaux Mérignac' },
  LFQQ: { lat: 50.5619, lon: 3.0894, name: 'Lille Lesquin' },
  LIL: { lat: 50.5619, lon: 3.0894, name: 'Lille Lesquin' },
  LFST: { lat: 48.5383, lon: 7.6282, name: 'Strasbourg Entzheim' },
  SXB: { lat: 48.5383, lon: 7.6282, name: 'Strasbourg Entzheim' },
  LFRS: { lat: 47.1532, lon: -1.6107, name: 'Nantes Atlantique' },
  NTE: { lat: 47.1532, lon: -1.6107, name: 'Nantes Atlantique' },
  LFBT: { lat: 43.1786, lon: -0.0064, name: 'Tarbes-Lourdes-Pyrénées' },
  LDE: { lat: 43.1786, lon: -0.0064, name: 'Tarbes-Lourdes-Pyrénées' },
  LFBP: { lat: 43.3800, lon: -0.4186, name: 'Pau Pyrénées' },
  PUF: { lat: 43.3800, lon: -0.4186, name: 'Pau Pyrénées' },
  LFBZ: { lat: 43.4683, lon: -1.5233, name: 'Biarritz Pays Basque' },
  BIQ: { lat: 43.4683, lon: -1.5233, name: 'Biarritz Pays Basque' },
  LFOB: { lat: 49.4544, lon: 2.1128, name: 'Beauvais Tillé' },
  BVA: { lat: 49.4544, lon: 2.1128, name: 'Beauvais Tillé' },
  LFKJ: { lat: 41.9236, lon: 8.8028, name: 'Ajaccio Napoléon Bonaparte' },
  AJA: { lat: 41.9236, lon: 8.8028, name: 'Ajaccio Napoléon Bonaparte' },
  LFKB: { lat: 42.5528, lon: 9.4836, name: 'Bastia Poretta' },
  BIA: { lat: 42.5528, lon: 9.4836, name: 'Bastia Poretta' },
  LFMP: { lat: 42.7408, lon: 2.8706, name: 'Perpignan Rivesaltes' },
  PGF: { lat: 42.7408, lon: 2.8706, name: 'Perpignan Rivesaltes' },

  // United Kingdom & Ireland
  EGLL: { lat: 51.4700, lon: -0.4543, name: 'London Heathrow' },
  LHR: { lat: 51.4700, lon: -0.4543, name: 'London Heathrow' },
  EGKK: { lat: 51.1537, lon: -0.1821, name: 'London Gatwick' },
  LGW: { lat: 51.1537, lon: -0.1821, name: 'London Gatwick' },
  EGSS: { lat: 51.8860, lon: 0.2389, name: 'London Stansted' },
  STN: { lat: 51.8860, lon: 0.2389, name: 'London Stansted' },
  EGGW: { lat: 51.8747, lon: -0.3683, name: 'London Luton' },
  LTN: { lat: 51.8747, lon: -0.3683, name: 'London Luton' },
  EGCC: { lat: 53.3537, lon: -2.2750, name: 'Manchester' },
  MAN: { lat: 53.3537, lon: -2.2750, name: 'Manchester' },
  EGPH: { lat: 55.9500, lon: -3.3725, name: 'Edinburgh' },
  EDI: { lat: 55.9500, lon: -3.3725, name: 'Edinburgh' },
  EIDW: { lat: 53.4213, lon: -6.2700, name: 'Dublin' },
  DUB: { lat: 53.4213, lon: -6.2700, name: 'Dublin' },

  // Spain & Portugal
  LEMD: { lat: 40.4839, lon: -3.5680, name: 'Madrid Barajas' },
  MAD: { lat: 40.4839, lon: -3.5680, name: 'Madrid Barajas' },
  LEBL: { lat: 41.2974, lon: 2.0833, name: 'Barcelona El Prat' },
  BCN: { lat: 41.2974, lon: 2.0833, name: 'Barcelona El Prat' },
  LEPA: { lat: 39.5517, lon: 2.7388, name: 'Palma de Mallorca' },
  PMI: { lat: 39.5517, lon: 2.7388, name: 'Palma de Mallorca' },
  LEMH: { lat: 39.8626, lon: 4.2186, name: 'Menorca' },
  MAH: { lat: 39.8626, lon: 4.2186, name: 'Menorca' },
  LEIB: { lat: 38.8729, lon: 1.3731, name: 'Ibiza' },
  IBZ: { lat: 38.8729, lon: 1.3731, name: 'Ibiza' },
  LEAL: { lat: 38.2822, lon: -0.5581, name: 'Alicante-Elche' },
  ALC: { lat: 38.2822, lon: -0.5581, name: 'Alicante-Elche' },
  LEMG: { lat: 36.6749, lon: -4.4991, name: 'Malaga Costa del Sol' },
  AGP: { lat: 36.6749, lon: -4.4991, name: 'Malaga Costa del Sol' },
  LEVC: { lat: 39.4893, lon: -0.4816, name: 'Valencia' },
  VLC: { lat: 39.4893, lon: -0.4816, name: 'Valencia' },
  LEZL: { lat: 37.4180, lon: -5.8931, name: 'Seville' },
  SVQ: { lat: 37.4180, lon: -5.8931, name: 'Seville' },
  LEBB: { lat: 43.3011, lon: -2.9106, name: 'Bilbao' },
  BIO: { lat: 43.3011, lon: -2.9106, name: 'Bilbao' },
  LESO: { lat: 43.3564, lon: -1.7906, name: 'San Sebastián' },
  EAS: { lat: 43.3564, lon: -1.7906, name: 'San Sebastián' },
  LEXJ: { lat: 43.4271, lon: -3.8200, name: 'Santander' },
  SDR: { lat: 43.4271, lon: -3.8200, name: 'Santander' },
  LEAS: { lat: 43.5636, lon: -6.0346, name: 'Asturias' },
  OVD: { lat: 43.5636, lon: -6.0346, name: 'Asturias' },
  LEST: { lat: 42.8963, lon: -8.4151, name: 'Santiago de Compostela' },
  SCQ: { lat: 42.8963, lon: -8.4151, name: 'Santiago de Compostela' },
  LEZG: { lat: 41.6662, lon: -1.0416, name: 'Zaragoza' },
  ZAZ: { lat: 41.6662, lon: -1.0416, name: 'Zaragoza' },
  LEGE: { lat: 41.9009, lon: 2.7606, name: 'Girona Costa Brava' },
  GRO: { lat: 41.9009, lon: 2.7606, name: 'Girona Costa Brava' },
  LERS: { lat: 41.1475, lon: 1.1672, name: 'Reus' },
  REU: { lat: 41.1475, lon: 1.1672, name: 'Reus' },
  LEPP: { lat: 42.7700, lon: -1.6464, name: 'Pamplona' },
  PNA: { lat: 42.7700, lon: -1.6464, name: 'Pamplona' },
  LEVT: { lat: 42.8828, lon: -2.7244, name: 'Vitoria' },
  VIT: { lat: 42.8828, lon: -2.7244, name: 'Vitoria' },
  LPPT: { lat: 38.7756, lon: -9.1354, name: 'Lisbon Humberto Delgado' },
  LIS: { lat: 38.7756, lon: -9.1354, name: 'Lisbon Humberto Delgado' },
  LPPR: { lat: 41.2481, lon: -8.6814, name: 'Porto Francisco Sá Carneiro' },
  OPO: { lat: 41.2481, lon: -8.6814, name: 'Porto Francisco Sá Carneiro' },
  LPFR: { lat: 37.0144, lon: -7.9659, name: 'Faro' },
  FAO: { lat: 37.0144, lon: -7.9659, name: 'Faro' },

  // Benelux & Germany
  EHAM: { lat: 52.3105, lon: 4.7683, name: 'Amsterdam Schiphol' },
  AMS: { lat: 52.3105, lon: 4.7683, name: 'Amsterdam Schiphol' },
  EBBR: { lat: 50.9014, lon: 4.4844, name: 'Brussels National' },
  BRU: { lat: 50.9014, lon: 4.4844, name: 'Brussels National' },
  EBLG: { lat: 50.6374, lon: 5.4432, name: 'Liège' },
  LGG: { lat: 50.6374, lon: 5.4432, name: 'Liège' },
  EDDF: { lat: 50.0379, lon: 8.5622, name: 'Frankfurt am Main' },
  FRA: { lat: 50.0379, lon: 8.5622, name: 'Frankfurt am Main' },
  EDDM: { lat: 48.3538, lon: 11.7861, name: 'Munich Franz Josef Strauss' },
  MUC: { lat: 48.3538, lon: 11.7861, name: 'Munich Franz Josef Strauss' },
  EDDB: { lat: 52.3667, lon: 13.5033, name: 'Berlin Brandenburg' },
  BER: { lat: 52.3667, lon: 13.5033, name: 'Berlin Brandenburg' },
  EDDL: { lat: 51.2895, lon: 6.7668, name: 'Düsseldorf' },
  DUS: { lat: 51.2895, lon: 6.7668, name: 'Düsseldorf' },
  EDDH: { lat: 53.6304, lon: 9.9882, name: 'Hamburg' },
  HAM: { lat: 53.6304, lon: 9.9882, name: 'Hamburg' },

  // Switzerland & Austria
  LSZH: { lat: 47.4582, lon: 8.5555, name: 'Zurich Kloten' },
  ZRH: { lat: 47.4582, lon: 8.5555, name: 'Zurich Kloten' },
  LSGG: { lat: 46.2370, lon: 6.1092, name: 'Geneva Cointrin' },
  GVA: { lat: 46.2370, lon: 6.1092, name: 'Geneva Cointrin' },
  LFSB: { lat: 47.5896, lon: 7.5299, name: 'EuroAirport Basel Mulhouse Freiburg' },
  BSL: { lat: 47.5896, lon: 7.5299, name: 'EuroAirport Basel Mulhouse Freiburg' },
  LOWW: { lat: 48.1103, lon: 16.5697, name: 'Vienna Schwechat' },
  VIE: { lat: 48.1103, lon: 16.5697, name: 'Vienna Schwechat' },

  // Italy
  LIRF: { lat: 41.8003, lon: 12.2389, name: 'Rome Fiumicino' },
  FCO: { lat: 41.8003, lon: 12.2389, name: 'Rome Fiumicino' },
  LIMC: { lat: 45.6300, lon: 8.7231, name: 'Milan Malpensa' },
  MXP: { lat: 45.6300, lon: 8.7231, name: 'Milan Malpensa' },
  LIML: { lat: 45.4451, lon: 9.2767, name: 'Milan Linate' },
  LIN: { lat: 45.4451, lon: 9.2767, name: 'Milan Linate' },
  LIPZ: { lat: 45.5053, lon: 12.3519, name: 'Venice Marco Polo' },
  VCE: { lat: 45.5053, lon: 12.3519, name: 'Venice Marco Polo' },
  LIRN: { lat: 40.8860, lon: 14.2908, name: 'Naples Capodichino' },
  NAP: { lat: 40.8860, lon: 14.2908, name: 'Naples Capodichino' },
  LICC: { lat: 37.4668, lon: 15.0664, name: 'Catania Fontanarossa' },
  CTA: { lat: 37.4668, lon: 15.0664, name: 'Catania Fontanarossa' },

  // Other Europe
  LGAV: { lat: 37.9364, lon: 23.9445, name: 'Athens Eleftherios Venizelos' },
  ATH: { lat: 37.9364, lon: 23.9445, name: 'Athens Eleftherios Venizelos' },
  LTFM: { lat: 41.2753, lon: 28.7519, name: 'Istanbul Airport' },
  IST: { lat: 41.2753, lon: 28.7519, name: 'Istanbul Airport' },
  EPWA: { lat: 52.1657, lon: 20.9671, name: 'Warsaw Chopin' },
  WAW: { lat: 52.1657, lon: 20.9671, name: 'Warsaw Chopin' },
  LKPR: { lat: 50.1008, lon: 14.2600, name: 'Prague Václav Havel' },
  PRG: { lat: 50.1008, lon: 14.2600, name: 'Prague Václav Havel' },
  LHBP: { lat: 47.4369, lon: 19.2556, name: 'Budapest Ferenc Liszt' },
  BUD: { lat: 47.4369, lon: 19.2556, name: 'Budapest Ferenc Liszt' },
  ENGM: { lat: 60.1976, lon: 11.1004, name: 'Oslo Gardermoen' },
  OSL: { lat: 60.1976, lon: 11.1004, name: 'Oslo Gardermoen' },
  ESSA: { lat: 59.6519, lon: 17.9186, name: 'Stockholm Arlanda' },
  ARN: { lat: 59.6519, lon: 17.9186, name: 'Stockholm Arlanda' },
  EKCH: { lat: 55.6180, lon: 12.6560, name: 'Copenhagen Kastrup' },
  CPH: { lat: 55.6180, lon: 12.6560, name: 'Copenhagen Kastrup' },
  EFHK: { lat: 60.3172, lon: 24.9633, name: 'Helsinki Vantaa' },
  HEL: { lat: 60.3172, lon: 24.9633, name: 'Helsinki Vantaa' },

  // International Hubs
  KJFK: { lat: 40.6413, lon: -73.7781, name: 'New York JFK' },
  JFK: { lat: 40.6413, lon: -73.7781, name: 'New York JFK' },
  KORD: { lat: 41.9742, lon: -87.9073, name: 'Chicago O\'Hare' },
  ORD: { lat: 41.9742, lon: -87.9073, name: 'Chicago O\'Hare' },
  KLAX: { lat: 33.9425, lon: -118.4081, name: 'Los Angeles' },
  LAX: { lat: 33.9425, lon: -118.4081, name: 'Los Angeles' },
  OMDB: { lat: 25.2532, lon: 55.3657, name: 'Dubai International' },
  DXB: { lat: 25.2532, lon: 55.3657, name: 'Dubai International' },
  OTHH: { lat: 25.2731, lon: 51.6081, name: 'Doha Hamad' },
  DOH: { lat: 25.2731, lon: 51.6081, name: 'Doha Hamad' },
  VHHH: { lat: 22.3080, lon: 113.9185, name: 'Hong Kong International' },
  HKG: { lat: 22.3080, lon: 113.9185, name: 'Hong Kong International' },
  RJTT: { lat: 35.5494, lon: 139.7798, name: 'Tokyo Haneda' },
  HND: { lat: 35.5494, lon: 139.7798, name: 'Tokyo Haneda' },
  RJAA: { lat: 35.7647, lon: 140.3863, name: 'Tokyo Narita' },
  NRT: { lat: 35.7647, lon: 140.3863, name: 'Tokyo Narita' },
  WSSS: { lat: 1.3644, lon: 103.9915, name: 'Singapore Changi' },
  SIN: { lat: 1.3644, lon: 103.9915, name: 'Singapore Changi' },
};

/**
 * Resolves [lat, lon] coordinates and airport identifier
 * Supports:
 * 1. FlightAware [lon, lat] raw coordinates
 * 2. AIRPORT_PRESETS
 * 3. AIRPORT_COORDINATES_MAP lookup
 */
export function resolveAirportCoordinates(
  iata?: string,
  icao?: string,
  providedCoord?: [number, number] | null
): { lat: number; lon: number; label: string; name?: string } | null {
  // If FlightAware directly gave coordinates [lon, lat]
  if (
    providedCoord &&
    Array.isArray(providedCoord) &&
    providedCoord.length === 2 &&
    typeof providedCoord[0] === 'number' &&
    typeof providedCoord[1] === 'number' &&
    !isNaN(providedCoord[0]) &&
    !isNaN(providedCoord[1])
  ) {
    const [lon, lat] = providedCoord;
    const label = (iata || icao || 'APT').toUpperCase();
    return { lat, lon, label };
  }

  const cleanIata = (iata || '').trim().toUpperCase();
  const cleanIcao = (icao || '').trim().toUpperCase();

  // Check presets
  if (cleanIcao || cleanIata) {
    const preset = AIRPORT_PRESETS.find(
      (p) =>
        (cleanIcao && p.icao.toUpperCase() === cleanIcao) ||
        (cleanIata && p.iata?.toUpperCase() === cleanIata)
    );
    if (preset) {
      return {
        lat: preset.lat,
        lon: preset.lon,
        label: preset.iata || preset.icao,
        name: preset.name,
      };
    }
  }

  // Check lookup table by ICAO
  if (cleanIcao && AIRPORT_COORDINATES_MAP[cleanIcao]) {
    const entry = AIRPORT_COORDINATES_MAP[cleanIcao];
    return {
      lat: entry.lat,
      lon: entry.lon,
      label: cleanIata || cleanIcao,
      name: entry.name,
    };
  }

  // Check lookup table by IATA
  if (cleanIata && AIRPORT_COORDINATES_MAP[cleanIata]) {
    const entry = AIRPORT_COORDINATES_MAP[cleanIata];
    return {
      lat: entry.lat,
      lon: entry.lon,
      label: cleanIata,
      name: entry.name,
    };
  }

  return null;
}
