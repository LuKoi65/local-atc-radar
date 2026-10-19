export interface Airspace {
  id: string;
  name: string;
  classification: 'C' | 'D' | 'E' | 'R';
  floor: string;
  ceiling: string;
  color: string;
  polygon: [number, number][];
}

export const AIRSPACES_PRESET: Airspace[] = [
  // LFBT CTR Tarbes Lourdes (Class D, SFC to 2500 ft AMSL)
  {
    id: 'CTR_LFBT',
    name: 'CTR TARBES LOURDES',
    classification: 'D',
    floor: 'SFC',
    ceiling: '2500 FT',
    color: '#00e5ff',
    polygon: [
      [43.2850, -0.0900],
      [43.2750, 0.0800],
      [43.1400, 0.0850],
      [43.0700, 0.0100],
      [43.0800, -0.1100],
      [43.2100, -0.1150],
    ],
  },

  // LFBP CTR Pau Pyrénées (Class D, SFC to 2500 ft AMSL)
  {
    id: 'CTR_LFBP',
    name: 'CTR PAU PYRÉNÉES',
    classification: 'D',
    floor: 'SFC',
    ceiling: '2500 FT',
    color: '#00e5ff',
    polygon: [
      [43.4600, -0.5500],
      [43.4500, -0.3100],
      [43.3200, -0.2800],
      [43.2900, -0.4800],
      [43.3700, -0.5800],
    ],
  },

  // TMA Pyrénées 1 (Class D, 2500 ft to FL115)
  {
    id: 'TMA_PYR_1',
    name: 'TMA PYRÉNÉES 1',
    classification: 'D',
    floor: '2500 FT',
    ceiling: 'FL115',
    color: '#00bb4a',
    polygon: [
      [43.6000, -0.7000],
      [43.6000, 0.2500],
      [43.0000, 0.3500],
      [42.9000, -0.4000],
      [43.1000, -0.8000],
    ],
  },

  // TMA Pyrénées 2 (Class D, 4500 ft to FL145)
  {
    id: 'TMA_PYR_2',
    name: 'TMA PYRÉNÉES 2',
    classification: 'D',
    floor: '4500 FT',
    ceiling: 'FL145',
    color: '#008855',
    polygon: [
      [43.7500, -0.9000],
      [43.7500, 0.5000],
      [42.8000, 0.6000],
      [42.7500, -0.6000],
      [43.2000, -1.0500],
    ],
  },

  // Military Low-Altitude Training Corridor LF-R 46
  {
    id: 'LFR_46',
    name: 'R46 PYRÉNÉES MIL',
    classification: 'R',
    floor: '800 FT AGL',
    ceiling: 'FL085',
    color: '#ffaa00',
    polygon: [
      [43.1000, 0.3000],
      [43.1500, 0.6000],
      [42.8500, 0.7000],
      [42.8000, 0.3500],
    ],
  },
];
