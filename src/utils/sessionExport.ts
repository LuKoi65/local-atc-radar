import { Aircraft } from '../services/adsb/types';
import { AlertLogEntry } from '../store/useAlertLogStore';

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function formatDateForFile(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const MM = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `${yyyy}${MM}${dd}_${hh}${mm}`;
}

export function exportSessionCsv(aircraftList: Aircraft[], alertEntries: AlertLogEntry[]) {
  const dateStr = formatDateForFile();
  const rows: string[] = [];

  // Section 1: Traffic Snapshot
  rows.push('--- LOCAL ATC RADAR - SESSION TRAFFIC EXPORT ---');
  rows.push(`Date Export (UTC): ${new Date().toISOString()}`);
  rows.push(`Nombre d'appareils actifs: ${aircraftList.length}`);
  rows.push('');
  rows.push([
    'Indicatif',
    'Code OACI (Hex)',
    'Immatriculation',
    'Type Avion',
    'Compagnie / Operateur',
    'Pays',
    'Latitude',
    'Longitude',
    'Altitude Baro (ft)',
    'Altitude GPS (ft)',
    'Vitesse Sol (kts)',
    'Cap / Route (°)',
    'Variometre (ft/min)',
    'Squawk',
    'Au Sol',
    'Distance Seuil (NM)',
    'Messages Recus',
    'Historique Points',
  ].join(';'));

  for (const ac of aircraftList) {
    rows.push([
      `"${ac.flight}"`,
      `"${ac.hex}"`,
      `"${ac.registration}"`,
      `"${ac.type}"`,
      `"${ac.operator}"`,
      `"${ac.country}"`,
      ac.lat.toFixed(5),
      ac.lon.toFixed(5),
      ac.altitudeFt,
      ac.altitudeGeomFt || '',
      ac.groundSpeedKts,
      ac.trackDeg,
      ac.baroRateFpm,
      `"${ac.squawk}"`,
      ac.isGround ? 'OUI' : 'NON',
      ac.distanceToThresholdNm?.toFixed(1) || '',
      ac.messages || '',
      ac.history?.length || 0,
    ].join(';'));
  }

  // Section 2: Alert Log Entries
  rows.push('');
  rows.push('--- JOURNAL DES ALERTES DE LA SESSION ---');
  rows.push([
    'Horodatage (UTC)',
    'Type Alerte',
    'Severite',
    'Appareil 1',
    'Appareil 2',
    'Details',
  ].join(';'));

  for (const log of alertEntries) {
    const time = new Date(log.timestamp).toISOString();
    rows.push([
      `"${time}"`,
      `"${log.type}"`,
      `"${log.severity}"`,
      `"${log.callsign1} (${log.hex1})"`,
      log.callsign2 ? `"${log.callsign2} (${log.hex2 || ''})"` : '""',
      `"${log.details.replace(/"/g, '""')}"`,
    ].join(';'));
  }

  const csvContent = '\uFEFF' + rows.join('\r\n'); // UTF-8 BOM for Excel compatibility
  downloadFile(csvContent, `atc-radar-session_${dateStr}.csv`, 'text/csv;charset=utf-8;');
}

export function exportSessionJson(aircraftList: Aircraft[], alertEntries: AlertLogEntry[], airportIcao?: string) {
  const dateStr = formatDateForFile();
  const snapshot = {
    exportedAt: new Date().toISOString(),
    airport: airportIcao || 'LOCAL',
    aircraftCount: aircraftList.length,
    alertsCount: alertEntries.length,
    traffic: aircraftList.map((ac) => ({
      hex: ac.hex,
      flight: ac.flight,
      registration: ac.registration,
      type: ac.type,
      operator: ac.operator,
      country: ac.country,
      position: {
        lat: ac.lat,
        lon: ac.lon,
        altitudeFt: ac.altitudeFt,
        altitudeGeomFt: ac.altitudeGeomFt,
        groundSpeedKts: ac.groundSpeedKts,
        trackDeg: ac.trackDeg,
        baroRateFpm: ac.baroRateFpm,
        isGround: ac.isGround,
      },
      squawk: ac.squawk,
      distanceToThresholdNm: ac.distanceToThresholdNm,
      messages: ac.messages,
      lastSeen: ac.lastSeen,
      historyTrailPoints: ac.history,
    })),
    alertsLog: alertEntries,
  };

  const jsonContent = JSON.stringify(snapshot, null, 2);
  downloadFile(jsonContent, `atc-radar-session_${dateStr}.json`, 'application/json;charset=utf-8;');
}
