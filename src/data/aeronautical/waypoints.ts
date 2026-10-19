export interface Waypoint {
  name: string;
  lat: number;
  lon: number;
  type: 'RNAV' | 'COMPULSORY' | 'TERMINAL';
}

export const WAYPOINTS_PRESET: Waypoint[] = [
  // Tarbes LFBT Terminal fixes & RNAV points
  { name: 'EBKOS', lat: 43.4500, lon: 0.1200, type: 'COMPULSORY' },
  { name: 'ARFOL', lat: 43.3200, lon: 0.2800, type: 'COMPULSORY' },
  { name: 'BEBIX', lat: 42.9200, lon: -0.1500, type: 'COMPULSORY' },
  { name: 'FOUCO', lat: 43.0200, lon: 0.2200, type: 'COMPULSORY' },
  { name: 'LURDO', lat: 43.2800, lon: 0.0500, type: 'TERMINAL' },
  { name: 'OSQIL', lat: 43.2200, lon: 0.1400, type: 'TERMINAL' },
  { name: 'SECHE', lat: 43.3500, lon: -0.1800, type: 'TERMINAL' },
  { name: 'NARAK', lat: 43.0500, lon: -0.0500, type: 'TERMINAL' },
  { name: 'BT401', lat: 43.0500, lon: -0.0650, type: 'TERMINAL' },
  { name: 'BT402', lat: 43.1100, lon: -0.0350, type: 'TERMINAL' },
  { name: 'BT403', lat: 43.2500, lon: 0.0250, type: 'TERMINAL' },

  // Pau LFBP Terminal fixes
  { name: 'VASIS', lat: 43.5800, lon: -0.2200, type: 'COMPULSORY' },
  { name: 'LOMRA', lat: 43.4800, lon: -0.6800, type: 'COMPULSORY' },
  { name: 'SAUNI', lat: 43.2200, lon: -0.2000, type: 'COMPULSORY' },
  { name: 'PU401', lat: 43.4600, lon: -0.3200, type: 'TERMINAL' },
  { name: 'PU402', lat: 43.4200, lon: -0.5200, type: 'TERMINAL' },
  { name: 'PU403', lat: 43.3100, lon: -0.3200, type: 'TERMINAL' },

  // Regional Enroute Fixes
  { name: 'ROBAL', lat: 43.8200, lon: -0.1200, type: 'RNAV' },
  { name: 'GAI', lat: 43.9500, lon: 1.8300, type: 'RNAV' },
  { name: 'MEN', lat: 44.0200, lon: 0.2800, type: 'RNAV' },
];
