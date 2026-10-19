import React from 'react';
import {
  X,
  Plane,
  Gauge,
  Navigation,
  Compass,
  Radio,
  Clock,
  AlertTriangle,
  LocateFixed,
} from 'lucide-react';
import { useTrafficStore } from '../../store/useTrafficStore';
import { useAirportStore } from '../../store/useAirportStore';
import {
  formatAltitude,
  formatVerticalTrend,
  inspectSquawk,
  normalizeBearing,
} from '../../utils/aviationMath';

export const TowerInspector: React.FC = () => {
  const selectedHex = useTrafficStore((state) => state.selectedHex);
  const selectAircraft = useTrafficStore((state) => state.selectAircraft);
  const getSelectedAircraft = useTrafficStore((state) => state.getSelectedAircraft);

  const currentAirport = useAirportStore((state) => state.currentAirport);
  const activeRunwayId = useAirportStore((state) => state.activeRunwayId);
  const getActiveRunwayEnd = useAirportStore((state) => state.getActiveRunwayEnd);

  const aircraft = getSelectedAircraft();
  const activeRunwayEnd = getActiveRunwayEnd();

  if (!selectedHex || !aircraft) return null;

  const squawkInfo = inspectSquawk(aircraft.squawk);
  const trend = formatVerticalTrend(aircraft.baroRateFpm);
  const altFormatted = formatAltitude(
    aircraft.altitudeFt,
    currentAirport.transitionAltitudeFt
  );

  // Approach alignment calculations
  const rwyHeading = activeRunwayEnd?.heading || 0;
  const reciprocalApproachHeading = normalizeBearing(rwyHeading + 180);
  
  // Track alignment difference with runway heading
  const trackDiff = ((aircraft.trackDeg - rwyHeading + 540) % 360) - 180;
  const isOnApproachHeading = Math.abs(trackDiff) <= 15;

  // ETA to threshold in seconds
  let etaSeconds: number | null = null;
  if (aircraft.distanceToThresholdNm && aircraft.groundSpeedKts > 30) {
    etaSeconds = Math.round((aircraft.distanceToThresholdNm / aircraft.groundSpeedKts) * 3600);
  }

  const formatEta = (sec: number | null) => {
    if (sec === null) return '--:--';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <aside className="absolute right-3 top-14 bottom-11 w-80 bg-radar-panel/95 backdrop-blur-md border border-radar-cyan/60 rounded-sm shadow-2xl z-[450] flex flex-col font-mono text-radar-green overflow-hidden select-none animate-in fade-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="bg-radar-surface/90 px-3 py-2 border-b border-radar-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Plane className="w-4 h-4 text-radar-cyan" />
          <span className="font-extrabold text-radar-cyan text-sm tracking-wider">
            TOWER INSPECTOR
          </span>
        </div>
        <button
          onClick={() => selectAircraft(null)}
          className="text-radar-muted hover:text-radar-alert transition-colors p-1"
          title="Deselect aircraft"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Emergency Alert Banner */}
      {squawkInfo.isEmergency && (
        <div className="bg-radar-alert/20 border-b border-radar-alert px-3 py-2 flex items-center gap-2 text-radar-alert font-bold text-xs animate-atc-blink">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>ALERT: SQUAWK {aircraft.squawk} ({squawkInfo.alertType})</span>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
        {/* Callsign & Aircraft Identity Card */}
        <div className="bg-radar-surface/60 p-2.5 rounded border border-radar-border">
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-radar-green text-glow-green tracking-wide">
              {aircraft.flight}
            </span>
            <span className="text-radar-cyan font-bold text-sm bg-radar-surface px-1.5 py-0.5 rounded border border-radar-cyan/30">
              {aircraft.type}
            </span>
          </div>
          <div className="flex justify-between items-center mt-1 text-[11px] text-radar-muted">
            <span>REG: <strong className="text-radar-green">{aircraft.registration}</strong></span>
            <span>HEX: <strong className="text-radar-cyan">{aircraft.hex}</strong></span>
          </div>
        </div>

        {/* Flight Dynamics (Altitude, Speed, Heading, Vertical Speed) */}
        <div className="grid grid-cols-2 gap-2">
          {/* Altitude */}
          <div className="bg-radar-surface/60 p-2 rounded border border-radar-border">
            <div className="flex items-center gap-1 text-radar-muted text-[10px]">
              <Gauge className="w-3 h-3 text-radar-cyan" />
              <span>ALTITUDE</span>
            </div>
            <div className="text-base font-bold text-radar-green mt-0.5">
              {altFormatted}
            </div>
            <div className="text-[10px] text-radar-muted flex justify-between mt-0.5">
              <span>{aircraft.altitudeFt.toLocaleString()} FT</span>
              <span className="font-bold text-radar-cyan">{aircraft.isGround ? 'GND' : 'MSL'}</span>
            </div>
          </div>

          {/* Vertical Rate */}
          <div className="bg-radar-surface/60 p-2 rounded border border-radar-border">
            <div className="flex items-center gap-1 text-radar-muted text-[10px]">
              <Navigation className="w-3 h-3 text-radar-amber" />
              <span>V / S RATE</span>
            </div>
            <div className="text-base font-bold text-radar-green mt-0.5 flex items-center gap-1">
              <span>{trend.symbol}</span>
              <span>{Math.abs(aircraft.baroRateFpm)}</span>
              <span className="text-[10px] text-radar-muted font-normal">FPM</span>
            </div>
            <div className="text-[10px] text-radar-muted mt-0.5">
              STATUS: <strong className={trend.label === 'CLB' ? 'text-radar-cyan' : trend.label === 'DES' ? 'text-radar-amber' : 'text-radar-muted'}>{trend.label}</strong>
            </div>
          </div>

          {/* Ground Speed */}
          <div className="bg-radar-surface/60 p-2 rounded border border-radar-border">
            <div className="flex items-center gap-1 text-radar-muted text-[10px]">
              <Clock className="w-3 h-3 text-radar-cyan" />
              <span>GROUND SPEED</span>
            </div>
            <div className="text-base font-bold text-radar-green mt-0.5">
              {aircraft.groundSpeedKts}{' '}
              <span className="text-[10px] text-radar-muted font-normal">KTS</span>
            </div>
            <div className="text-[10px] text-radar-muted mt-0.5">
              {Math.round(aircraft.groundSpeedKts * 1.852)} KM/H
            </div>
          </div>

          {/* Track Heading */}
          <div className="bg-radar-surface/60 p-2 rounded border border-radar-border">
            <div className="flex items-center gap-1 text-radar-muted text-[10px]">
              <Compass className="w-3 h-3 text-radar-green" />
              <span>TRACK / HDG</span>
            </div>
            <div className="text-base font-bold text-radar-green mt-0.5">
              {aircraft.trackDeg.toString().padStart(3, '0')}°
            </div>
            <div className="text-[10px] text-radar-muted mt-0.5">
              TRUE TRACK
            </div>
          </div>
        </div>

        {/* Transponder & Squawk */}
        <div className="bg-radar-surface/60 p-2 rounded border border-radar-border flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-radar-cyan" />
            <span className="text-radar-muted text-[11px]">SQUAWK CODE:</span>
          </div>
          <div className="text-sm font-black text-radar-cyan tracking-widest bg-radar-panel px-2 py-0.5 rounded border border-radar-border">
            {aircraft.squawk}
          </div>
        </div>

        {/* Runway Approach & Localizer Geometry */}
        <div className="bg-radar-surface/60 p-2.5 rounded border border-radar-border space-y-2">
          <div className="flex items-center justify-between border-b border-radar-border/60 pb-1 text-[11px]">
            <span className="font-bold text-radar-cyan">
              RUNWAY {activeRunwayId} APPROACH
            </span>
            <span className="text-[10px] text-radar-muted">
              HDG {rwyHeading}°
            </span>
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-radar-muted">DIST TO THRESHOLD:</span>
              <strong className="text-radar-green">
                {aircraft.distanceToThresholdNm?.toFixed(2)} NM
              </strong>
            </div>

            <div className="flex justify-between">
              <span className="text-radar-muted">BEARING FROM THRESHOLD:</span>
              <strong className="text-radar-green">
                {aircraft.bearingFromThresholdDeg?.toFixed(0).padStart(3, '0')}°
              </strong>
            </div>

            <div className="flex justify-between">
              <span className="text-radar-muted">LOCALIZER ALIGNMENT:</span>
              <strong
                className={
                  Math.abs(trackDiff) <= 5
                    ? 'text-radar-green font-bold'
                    : Math.abs(trackDiff) <= 15
                    ? 'text-radar-cyan'
                    : 'text-radar-muted'
                }
              >
                {Math.abs(trackDiff) <= 3
                  ? 'ON LOCALIZER'
                  : `${Math.abs(Math.round(trackDiff))}° ${
                      trackDiff > 0 ? 'RIGHT' : 'LEFT'
                    }`}
              </strong>
            </div>

            <div className="flex justify-between">
              <span className="text-radar-muted">ESTIMATED TIME TO THRESHOLD:</span>
              <strong className="text-radar-cyan font-bold">{formatEta(etaSeconds)}</strong>
            </div>
          </div>
        </div>

        {/* Sector Distance from ARP */}
        <div className="bg-radar-surface/40 p-2 rounded border border-radar-border text-[11px] flex justify-between">
          <span className="text-radar-muted">ARP RELATIVE:</span>
          <span>
            {aircraft.bearingFromArpDeg?.toFixed(0).padStart(3, '0')}° /{' '}
            <strong className="text-radar-green">
              {aircraft.distanceToArpNm?.toFixed(1)} NM
            </strong>
          </span>
        </div>

        {/* History Trail Points */}
        <div className="bg-radar-surface/30 p-2 rounded border border-radar-border text-[10px]">
          <div className="text-radar-muted mb-1 font-bold">
            RADAR POSITION HISTORY ({aircraft.history.length}/5 DOTS):
          </div>
          <div className="space-y-0.5">
            {aircraft.history.map((pt, i) => (
              <div key={i} className="flex justify-between text-radar-muted">
                <span>DOT #{i + 1}</span>
                <span>
                  {pt.lat.toFixed(4)}°, {pt.lon.toFixed(4)}°
                </span>
                <span className="text-radar-green">
                  {formatAltitude(pt.altitudeFt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-2 border-t border-radar-border bg-radar-surface/80 flex gap-2">
        <button
          onClick={() => selectAircraft(null)}
          className="flex-1 py-1 rounded bg-radar-surface border border-radar-border hover:bg-radar-panel text-radar-muted hover:text-radar-green transition-colors text-xs font-bold"
        >
          DESELECT
        </button>
      </div>
    </aside>
  );
};
