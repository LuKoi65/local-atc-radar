export interface Navaid {
  ident: string;
  name: string;
  type: 'VOR' | 'VOR_DME' | 'NDB' | 'TACAN';
  frequency: string;
  lat: number;
  lon: number;
  elevationFt: number;
  morse?: string;
}

export const NAVAIDS_PRESET: Navaid[] = [
  {
    ident: 'TLP',
    name: 'Tarbes Lourdes VOR/DME',
    type: 'VOR_DME',
    frequency: '110.70 MHz',
    lat: 43.1795,
    lon: -0.0051,
    elevationFt: 1260,
    morse: '- .-.. .--.',
  },
  {
    ident: 'TBO',
    name: 'Tarbes Ossun VOR',
    type: 'VOR',
    frequency: '114.45 MHz',
    lat: 43.1950,
    lon: -0.0120,
    elevationFt: 1280,
    morse: '- -... ---',
  },
  {
    ident: 'PAU',
    name: 'Pau Pyrénées VOR/DME',
    type: 'VOR_DME',
    frequency: '112.40 MHz',
    lat: 43.3850,
    lon: -0.4210,
    elevationFt: 620,
    morse: '.--. .- ..-',
  },
  {
    ident: 'TOU',
    name: 'Toulouse Blagnac VOR/DME',
    type: 'VOR_DME',
    frequency: '117.70 MHz',
    lat: 43.6350,
    lon: 1.3700,
    elevationFt: 510,
    morse: '- --- ..-',
  },
  {
    ident: 'AGN',
    name: 'Agen La Garenne VOR/DME',
    type: 'VOR_DME',
    frequency: '114.80 MHz',
    lat: 44.1750,
    lon: 0.5900,
    elevationFt: 200,
    morse: '.- --. -.',
  },
  {
    ident: 'BSN',
    name: 'Biscarrosse VOR/DME',
    type: 'VOR_DME',
    frequency: '112.00 MHz',
    lat: 44.3600,
    lon: -1.2100,
    elevationFt: 110,
    morse: '-... ... -.',
  },
  {
    ident: 'PPG',
    name: 'Perpignan VOR/DME',
    type: 'VOR_DME',
    frequency: '115.65 MHz',
    lat: 42.7400,
    lon: 2.8700,
    elevationFt: 140,
    morse: '.--. .--. --.',
  },
  {
    ident: 'BT',
    name: 'Lourdes NDB',
    type: 'NDB',
    frequency: '388 kHz',
    lat: 43.1500,
    lon: -0.0200,
    elevationFt: 1250,
    morse: '-... -',
  },
  {
    ident: 'PO',
    name: 'Pau Uzein NDB',
    type: 'NDB',
    frequency: '334 kHz',
    lat: 43.3550,
    lon: -0.4450,
    elevationFt: 610,
    morse: '.--. ---',
  },
];
