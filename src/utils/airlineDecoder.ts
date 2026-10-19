/**
 * Base de données exhaustive des compagnies aériennes mondiales et européennes
 * Permet de décoder l'indicatif OACI 3-lettres en nom complet de la compagnie.
 */

export const AIRLINE_DATABASE: Record<string, string> = {
  // Compagnies majeures France & Sud-Ouest
  AFR: 'Air France',
  HOP: 'Air France Hop',
  TVF: 'Transavia France',
  TRA: 'Transavia',
  CRL: 'Corsair',
  FPO: 'ASL Airlines France',
  TAY: 'ASL Airlines Belgium',
  AIA: 'Aviasur',
  FWI: 'Air Caraïbes',
  BIE: 'Air Méditerranée',
  FNC: 'Air Corsica',
  AAE: 'Air Austral',
  LDI: 'La Compagnie',
  DAH: 'Air Algérie',
  RAM: 'Royal Air Maroc',
  TAR: 'Tunisair',

  // Low-Cost & Compagnies européennes fréquentes en France
  RYR: 'Ryanair',
  RYS: 'Buzz (Ryanair Group)',
  MAY: 'Malta Air (Ryanair Group)',
  EJU: 'easyJet Europe',
  EZY: 'easyJet',
  EZS: 'easyJet Switzerland',
  VLG: 'Vueling Airlines',
  VOE: 'Volotea',
  WZZ: 'Wizz Air',
  WUK: 'Wizz Air UK',
  WMT: 'Wizz Air Malta',
  WAW: 'Wizz Air Abu Dhabi',
  EXS: 'Jet2.com',
  EWG: 'Eurowings',
  EWE: 'Eurowings Europe',
  NOZ: 'Norwegian Air Shuttle',
  NAX: 'Norwegian Air Shuttle',
  IBK: 'Norwegian Air Sweden',
  NSZ: 'Norwegian Air',

  // Compagnies traditionnelles européennes (Legacy)
  DLH: 'Lufthansa',
  GEC: 'Lufthansa Cargo',
  CLH: 'Lufthansa CityLine',
  DLX: 'Lufthansa City Airlines',
  BAW: 'British Airways',
  SHT: 'British Airways (Shuttle)',
  CFE: 'BA CityFlyer',
  IBE: 'Iberia',
  IBS: 'Iberia Express',
  ANE: 'Air Nostrum (Iberia Regional)',
  AEA: 'Air Europa',
  KLM: 'KLM Royal Dutch Airlines',
  KLC: 'KLM Cityhopper',
  SWR: 'Swiss International Air Lines',
  EDW: 'Edelweiss Air',
  AUA: 'Austrian Airlines',
  BEL: 'Brussels Airlines',
  TAP: 'TAP Air Portugal',
  AZA: 'ITA Airways (ex-Alitalia)',
  ITY: 'ITA Airways',
  SAS: 'Scandinavian Airlines',
  FIN: 'Finnair',
  LOT: 'LOT Polish Airlines',
  AEE: 'Aegean Airlines',
  OAL: 'Olympic Air',
  EIN: 'Aer Lingus',
  TAP_EXPRESS: 'Portugália Airlines',
  PGA: 'Portugália Airlines',
  ROT: 'TAROM',
  CSA: 'Czech Airlines',
  ASL: 'Air Serbia',
  CRO: 'Croatia Airlines',
  LZB: 'Bulgaria Air',
  BOU: 'Bouraq',
  CYP: 'Cyprus Airways',
  ISS: 'Air Italy',

  // Compagnies TUI & Loisirs
  TUI: 'TUIfly',
  TFL: 'TUI fly Netherlands',
  JAF: 'TUI fly Belgium',
  TOM: 'TUI Airways UK',
  BLX: 'TUIfly Nordic',
  CFG: 'Condor',
  TCX: 'Thomas Cook',
  ENT: 'Enter Air',
  SXD: 'SunExpress',
  SXS: 'SunExpress Deutschland',
  CAI: 'Corendon Airlines',
  CND: 'Corendon Dutch Airlines',
  CXI: 'Corendon Airlines Europe',

  // Compagnies Turquie & Moyen-Orient
  THY: 'Turkish Airlines',
  PGT: 'Pegasus Airlines',
  FHY: 'Freebird Airlines',
  MSR: 'EgyptAir',
  UAE: 'Emirates',
  QTR: 'Qatar Airways',
  ETD: 'Etihad Airways',
  FDB: 'flydubai',
  ABY: 'Air Arabia',
  GFA: 'Gulf Air',
  OMA: 'Oman Air',
  KAC: 'Kuwait Airways',
  RJA: 'Royal Jordanian',
  MEA: 'Middle East Airlines',
  SVA: 'Saudia',
  ELY: 'El Al Israel Airlines',
  IZM: 'Izmir Airlines',

  // Amériques & Transatlantique
  AAL: 'American Airlines',
  DAL: 'Delta Air Lines',
  UAL: 'United Airlines',
  ACA: 'Air Canada',
  ROU: 'Air Canada Rouge',
  WJA: 'WestJet',
  TSC: 'Air Transat',
  AMX: 'Aeroméxico',
  LAN: 'LATAM Airlines',
  LPE: 'LATAM Peru',
  TAM: 'LATAM Brasil',
  AVA: 'Avianca',
  CMP: 'Copa Airlines',
  AZU: 'Azul Brazilian Airlines',
  GLO: 'Gol Transportes Aéreos',
  ARG: 'Aerolíneas Argentinas',
  SKU: 'Sky Airline',

  // Fret & Cargo
  FDX: 'FedEx Express',
  UPS: 'UPS Airlines',
  BCS: 'European Air Transport (DHL)',
  DHK: 'DHL Air UK',
  DHX: 'DHL International',
  MNB: 'MNG Airlines',
  CLX: 'Cargolux',
  GTI: 'Atlas Air',
  BOX: 'AeroLogic',
  PAC: 'Polar Air Cargo',
  ABW: 'AirBridgeCargo',
  KRE: 'Aero Charter',
  SWT: 'Swiftair',

  // Asie, Océanie & Autres
  SIA: 'Singapore Airlines',
  CPA: 'Cathay Pacific',
  JAL: 'Japan Airlines',
  ANA: 'All Nippon Airways',
  KAL: 'Korean Air',
  AAR: 'Asiana Airlines',
  EVA: 'EVA Air',
  CAL: 'China Airlines',
  CCA: 'Air China',
  CSN: 'China Southern Airlines',
  CES: 'China Eastern Airlines',
  CHH: 'Hainan Airlines',
  AIC: 'Air India',
  AXB: 'Air India Express',
  IGO: 'IndiGo',
  SEJ: 'SpiceJet',
  QFA: 'Qantas',
  ANZ: 'Air New Zealand',
  VOZ: 'Virgin Australia',
  VIR: 'Virgin Atlantic',
  ETH: 'Ethiopian Airlines',
  KQA: 'Kenya Airways',
  SAA: 'South African Airways',

  // Gouvernement & Militaire
  CTM: 'Armée de l\'Air Française (Cotam)',
  FAF: 'Armée de l\'Air Française',
  FNY: 'Aéronautique Navale Française',
  RFR: 'Royal Air Force',
  GAF: 'German Air Force (Luftwaffe)',
  AME: 'Armée de l\'Air Espagnole (Ejército del Aire)',
  IAM: 'Aeronautica Militare Italiana',
  BAF: 'Composante Air Belge',
  NAF: 'Royal Netherlands Air Force',
  SVF: 'Swedish Armed Forces',
  HAF: 'Hellenic Air Force',
  RCH: 'US Air Force (Air Mobility Command)',
  CNV: 'US Navy',
  PAT: 'US Army',
  VMX: 'US Marine Corps',
  SAM: 'United States VIP Special Air Mission',
};

/**
 * Décode le code OACI de la compagnie ou le préfixe du callsign
 * Exemples:
 * - "RYR33HM" -> "Ryanair"
 * - "AFR123" -> "Air France"
 * - "DLH456" -> "Lufthansa"
 */
export function decodeAirlineName(callsign?: string, ownOp?: string): string {
  if (ownOp && ownOp.trim().length > 3 && !/^[A-Z]{3}$/.test(ownOp.trim())) {
    return ownOp.trim();
  }

  if (!callsign) {
    return 'Aviation Générale';
  }

  const clean = callsign.trim().toUpperCase();

  // Si c'est une immatriculation générale (ex: F-GABC, N12345, D-EABC)
  if (/^[A-Z]-[A-Z]{4}$/.test(clean) || /^N\d+[A-Z]{0,2}$/.test(clean)) {
    return 'Aviation Générale / Privé';
  }

  // Extraire les 3 premières lettres
  const match = clean.match(/^([A-Z]{3})/);
  if (match) {
    const code = match[1];
    if (AIRLINE_DATABASE[code]) {
      return AIRLINE_DATABASE[code];
    }
  }

  // Fallback si 2 lettres (code IATA dans le callsign, ex: AF123)
  const iataMatch = clean.match(/^([A-Z0-9]{2})\d+/);
  if (iataMatch) {
    const iata = iataMatch[1];
    const iataMap: Record<string, string> = {
      AF: 'Air France',
      TO: 'Transavia France',
      FR: 'Ryanair',
      U2: 'easyJet',
      VY: 'Vueling Airlines',
      V7: 'Volotea',
      W6: 'Wizz Air',
      LH: 'Lufthansa',
      BA: 'British Airways',
      IB: 'Iberia',
      KL: 'KLM',
      LX: 'Swiss',
      OS: 'Austrian Airlines',
      SN: 'Brussels Airlines',
      TP: 'TAP Air Portugal',
      AZ: 'ITA Airways',
      TK: 'Turkish Airlines',
      PC: 'Pegasus Airlines',
      EK: 'Emirates',
      QR: 'Qatar Airways',
      EY: 'Etihad Airways',
      AT: 'Royal Air Maroc',
      AH: 'Air Algérie',
      TU: 'Tunisair',
    };
    if (iataMap[iata]) {
      return iataMap[iata];
    }
  }

  return clean.length >= 3 && !/^\d+$/.test(clean) ? clean.substring(0, 3) : 'Aviation Générale';
}
