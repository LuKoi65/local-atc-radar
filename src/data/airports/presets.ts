import { Airport } from './types';
import { destinationPointMeters, normalizeBearing } from '../../utils/aviationMath';

function makeRunway(
  id: string,
  end1Name: string,
  heading1: number,
  end2Name: string,
  heading2: number,
  arpLat: number,
  arpLon: number,
  lengthMeters: number,
  widthMeters: number = 45,
  elevationFt: number = 0,
  ils1?: { freq: string; ident: string },
  ils2?: { freq: string; ident: string }
) {
  const halfLength = lengthMeters / 2;
  const t1 = destinationPointMeters(arpLat, arpLon, normalizeBearing(heading1 + 180), halfLength);
  const t2 = destinationPointMeters(arpLat, arpLon, heading1, halfLength);

  return {
    id,
    lengthMeters,
    widthMeters,
    end1: {
      id: end1Name,
      heading: heading1,
      threshold: t1,
      elevationFt,
      ilsFrequency: ils1?.freq,
      ilsIdent: ils1?.ident,
    },
    end2: {
      id: end2Name,
      heading: heading2,
      threshold: t2,
      elevationFt,
      ilsFrequency: ils2?.freq,
      ilsIdent: ils2?.ident,
    },
  };
}

export const AIRPORT_PRESETS: Airport[] = [
  {
    icao: 'LFBT',
    iata: 'LDE',
    name: 'Tarbes-Lourdes-Pyrénées',
    city: 'Tarbes / Lourdes',
    country: 'France',
    lat: 43.1786,
    lon: -0.0064,
    elevationFt: 1260,
    transitionAltitudeFt: 5000,
    defaultActiveRunway: '02',
    runways: [
      makeRunway(
        '02/20',
        '02',
        22,
        '20',
        202,
        43.1786,
        -0.0064,
        3000,
        45,
        1260,
        { freq: '110.70', ident: 'TLP' },
        { freq: '109.90', ident: 'TLS' }
      ),
    ],
  },
  {
    icao: 'LFBP',
    iata: 'PUF',
    name: 'Pau-Pyrénées',
    city: 'Pau',
    country: 'France',
    lat: 43.3800,
    lon: -0.4186,
    elevationFt: 617,
    transitionAltitudeFt: 5000,
    defaultActiveRunway: '13',
    runways: [
      makeRunway(
        '13/31',
        '13',
        128,
        '31',
        308,
        43.3800,
        -0.4186,
        2500,
        45,
        617,
        { freq: '110.15', ident: 'PUF' }
      ),
    ],
  },
  {
    icao: 'LFBO',
    iata: 'TLS',
    name: 'Toulouse-Blagnac',
    city: 'Toulouse',
    country: 'France',
    lat: 43.6291,
    lon: 1.3638,
    elevationFt: 499,
    transitionAltitudeFt: 5000,
    defaultActiveRunway: '14R',
    runways: [
      makeRunway(
        '14R/32L',
        '14R',
        143,
        '32L',
        323,
        43.6291,
        1.3638,
        3500,
        45,
        499,
        { freq: '109.30', ident: 'TB' },
        { freq: '110.95', ident: 'TL' }
      ),
    ],
  },
];

export function createCustomAirport(
  icao: string,
  name: string,
  lat: number,
  lon: number,
  runwayName1: string,
  heading1: number,
  runwayName2: string,
  lengthMeters: number = 2800,
  elevationFt: number = 500
): Airport {
  const heading2 = normalizeBearing(heading1 + 180);
  const rwyId = `${runwayName1}/${runwayName2}`;

  return {
    icao: icao.toUpperCase().trim(),
    name: name.trim() || `${icao.toUpperCase()} Aerodrome`,
    city: 'Custom',
    country: 'User',
    lat,
    lon,
    elevationFt,
    transitionAltitudeFt: 5000,
    defaultActiveRunway: runwayName1,
    runways: [
      makeRunway(
        rwyId,
        runwayName1,
        heading1,
        end2RunwayName(runwayName1),
        heading2,
        lat,
        lon,
        lengthMeters,
        45,
        elevationFt
      ),
    ],
  };
}

function end2RunwayName(name1: string): string {
  const num = parseInt(name1.replace(/[^0-9]/g, ''), 10);
  if (isNaN(num)) return 'RWY';
  const reciprocal = ((num + 18 - 1) % 36) + 1;
  const suffix = name1.includes('L') ? 'R' : name1.includes('R') ? 'L' : name1.includes('C') ? 'C' : '';
  return `${reciprocal.toString().padStart(2, '0')}${suffix}`;
}
