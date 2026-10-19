export interface StarRoute {
  id: string;
  name: string;
  airportIcao: string;
  runwayId: string;
  minAltitude: string;
  color: string;
  points: { name: string; lat: number; lon: number; altConstraint?: string }[];
}

export const STARS_PRESET: StarRoute[] = [
  // LFBT RWY 02 STAR: EBKOS 2N
  {
    id: 'STAR_LFBT_02_EBKOS',
    name: 'EBKOS 2N',
    airportIcao: 'LFBT',
    runwayId: '02',
    minAltitude: '4000 FT',
    color: '#00e5ff',
    points: [
      { name: 'EBKOS', lat: 43.4500, lon: 0.1200, altConstraint: 'FL110' },
      { name: 'LURDO', lat: 43.2800, lon: 0.0500, altConstraint: '6000' },
      { name: 'TLP', lat: 43.1795, lon: -0.0051, altConstraint: '4000' },
      { name: 'BT401', lat: 43.0500, lon: -0.0650, altConstraint: '3000' },
    ],
  },

  // LFBT RWY 02 STAR: ARFOL 2N
  {
    id: 'STAR_LFBT_02_ARFOL',
    name: 'ARFOL 2N',
    airportIcao: 'LFBT',
    runwayId: '02',
    minAltitude: '4000 FT',
    color: '#00bb4a',
    points: [
      { name: 'ARFOL', lat: 43.3200, lon: 0.2800, altConstraint: 'FL100' },
      { name: 'OSQIL', lat: 43.2200, lon: 0.1400, altConstraint: '5000' },
      { name: 'BT401', lat: 43.0500, lon: -0.0650, altConstraint: '3000' },
    ],
  },

  // LFBT RWY 20 STAR: BEBIX 2P
  {
    id: 'STAR_LFBT_20_BEBIX',
    name: 'BEBIX 2P',
    airportIcao: 'LFBT',
    runwayId: '20',
    minAltitude: '4500 FT',
    color: '#00e5ff',
    points: [
      { name: 'BEBIX', lat: 42.9200, lon: -0.1500, altConstraint: 'FL120' },
      { name: 'BT402', lat: 43.1100, lon: -0.0350, altConstraint: '6000' },
      { name: 'BT403', lat: 43.2500, lon: 0.0250, altConstraint: '4500' },
    ],
  },

  // LFBP RWY 13 STAR: VASIS 1A
  {
    id: 'STAR_LFBP_13_VASIS',
    name: 'VASIS 1A',
    airportIcao: 'LFBP',
    runwayId: '13',
    minAltitude: '3500 FT',
    color: '#00e5ff',
    points: [
      { name: 'VASIS', lat: 43.5800, lon: -0.2200, altConstraint: 'FL100' },
      { name: 'PU401', lat: 43.4600, lon: -0.3200, altConstraint: '5000' },
      { name: 'PAU', lat: 43.3850, lon: -0.4210, altConstraint: '3500' },
    ],
  },

  // LFBP RWY 13 STAR: LOMRA 1A
  {
    id: 'STAR_LFBP_13_LOMRA',
    name: 'LOMRA 1A',
    airportIcao: 'LFBP',
    runwayId: '13',
    minAltitude: '3500 FT',
    color: '#00bb4a',
    points: [
      { name: 'LOMRA', lat: 43.4800, lon: -0.6800, altConstraint: 'FL090' },
      { name: 'PU402', lat: 43.4200, lon: -0.5200, altConstraint: '4000' },
      { name: 'PAU', lat: 43.3850, lon: -0.4210, altConstraint: '3500' },
    ],
  },
];
