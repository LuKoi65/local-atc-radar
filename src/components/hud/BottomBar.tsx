import React, { useState, useEffect, useMemo } from 'react';
import { Activity, Clock, Crosshair, MapPin, AlertTriangle } from 'lucide-react';
import { useTrafficStore } from '../../store/useTrafficStore';
import { useCursorStore } from '../../store/useCursorStore';
import { useAirportStore } from '../../store/useAirportStore';
import { useRadarSettingsStore } from '../../store/useRadarSettingsStore';
import { useAlertLogStore } from '../../store/useAlertLogStore';
import { useRulerStore } from '../../store/useRulerStore';
import { detectStcaConflicts } from '../../services/radar/stcaService';
import { AlertLogModal } from './AlertLogModal';
import { TRANSLATIONS } from '../../utils/i18n';

export const BottomBar: React.FC = () => {
  const [zuluTime, setZuluTime] = useState<string>('');

  const language = useRadarSettingsStore((state) => state.language);
  const t = TRANSLATIONS[language];

  const aircraftList = useTrafficStore((state) => state.aircraftList);
  const activeCount = useTrafficStore((state) => state.activeCount);
  const isPolling = useTrafficStore((state) => state.isPolling);
  const errorMessage = useTrafficStore((state) => state.errorMessage);
  const selectAircraft = useTrafficStore((state) => state.selectAircraft);

  const cursorLat = useCursorStore((state) => state.lat);
  const cursorLon = useCursorStore((state) => state.lon);
  const braBearing = useCursorStore((state) => state.braBearing);
  const braDistanceNm = useCursorStore((state) => state.braDistanceNm);

  const activeRunwayId = useAirportStore((state) => state.activeRunwayId);
  const dataSource = useRadarSettingsStore((state) => state.dataSource);

  // New modules: STCA, Trails, Ruler, Alerts
  const stcaEnabled = useRadarSettingsStore((state) => state.stcaEnabled);
  const trailLengthMode = useRadarSettingsStore((state) => state.trailLengthMode);
  const setTrailLengthMode = useRadarSettingsStore((state) => state.setTrailLengthMode);
  const alertLogModalOpen = useRadarSettingsStore((state) => state.alertLogModalOpen);
  const setAlertLogModalOpen = useRadarSettingsStore((state) => state.setAlertLogModalOpen);

  const unreadAlertCount = useAlertLogStore((state) => state.unreadCount);

  // Ruler state
  const rulerActive = useRulerStore((state) => state.isActive);
  const rulerDist = useRulerStore((state) => state.distanceNm);
  const rulerBearing = useRulerStore((state) => state.bearingDeg);
  const clearRuler = useRulerStore((state) => state.clearRuler);

  // Active STCA conflicts
  const mutedConflictIds = useRadarSettingsStore((state) => state.mutedConflictIds);
  const muteConflict = useRadarSettingsStore((state) => state.muteConflict);
  const { conflicts } = useMemo(() => {
    if (!stcaEnabled || aircraftList.length < 2) return { conflicts: [] };
    return detectStcaConflicts(aircraftList, mutedConflictIds);
  }, [aircraftList, stcaEnabled, mutedConflictIds]);

  const activeConflicts = conflicts.filter((c) => !c.isMuted);
  const topConflict = activeConflicts[0];

  // Live ticking Zulu clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getUTCHours().toString().padStart(2, '0');
      const mins = now.getUTCMinutes().toString().padStart(2, '0');
      const secs = now.getUTCSeconds().toString().padStart(2, '0');
      setZuluTime(`${hours}:${mins}:${secs} Z`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Format Cursor Lat/Lon string
  const formatCoord = (lat: number | null, lon: number | null) => {
    if (lat === null || lon === null) return 'LAT: --.----°  LON: ---.----°';
    const latStr = `${Math.abs(lat).toFixed(4)}°${lat >= 0 ? 'N' : 'S'}`;
    const lonStr = `${Math.abs(lon).toFixed(4)}°${lon >= 0 ? 'E' : 'O'}`;
    return `LAT: ${latStr}  LON: ${lonStr}`;
  };

  // Format BRA string
  const formatBra = (bearing: number | null, dist: number | null) => {
    if (bearing === null || dist === null) return `${t.cursorBra} (RWY ${activeRunwayId}): ---° / --.- NM`;
    const bStr = Math.round(bearing).toString().padStart(3, '0');
    const dStr = dist.toFixed(1);
    return `${t.cursorBra} (RWY ${activeRunwayId}): ${bStr}° / ${dStr} NM`;
  };

  return (
    <>
      <footer className="h-8 bg-radar-panel border-t border-radar-border px-3 flex items-center justify-between z-30 select-none text-[11px] text-radar-green font-mono gap-2">
        {/* Section Gauche : Horloge Zulu, Cibles, Erreurs */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 text-radar-cyan font-bold text-glow-cyan" title={t.zuluClock}>
            <Clock className="w-3.5 h-3.5" />
            <span>{zuluTime || '00:00:00 Z'}</span>
          </div>

          <div className="flex items-center gap-1.5 border-l border-radar-border pl-2.5">
            <Activity
              className={`w-3.5 h-3.5 ${
                isPolling ? 'text-radar-green animate-pulse' : 'text-radar-muted'
              }`}
            />
            <span className="text-radar-muted">
              {t.refreshRate} : <strong className="text-radar-green">2.0s</strong>
            </span>
            <span className="text-radar-muted">•</span>
            <span>
              {t.targets} : <strong className="text-radar-cyan font-bold">{activeCount}</strong>
            </span>
          </div>

          {errorMessage && (
            <div className="text-radar-alert font-bold border-l border-radar-border pl-2 animate-atc-blink truncate max-w-[200px]">
              {t.warningFeed} : {errorMessage}
            </div>
          )}
        </div>

        {/* Section Centre : Détection STCA active (Image 1) & Coordonnées curseur */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Bandeau d'Alerte STCA / Proximité en bas de l'écran avec bouton [✕] de désactivation manuelle */}
          {topConflict ? (
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => {
                  selectAircraft(topConflict.ac1.hex);
                  setAlertLogModalOpen(true);
                }}
                className={`h-6 px-3 rounded flex items-center gap-2 font-mono font-bold text-[10.5px] uppercase border transition-all shrink-0 ${
                  topConflict.level === 'warning'
                    ? 'bg-red-600 text-white border-red-300 shadow-[0_0_12px_rgba(255,0,0,0.8)] stca-warning-strobe'
                    : 'bg-[#cc8400] text-black border-amber-300 shadow-[0_0_10px_rgba(204,132,0,0.7)]'
                }`}
                title="Cliquer pour afficher les détails du conflit"
              >
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {topConflict.level === 'warning' ? 'STCA' : 'PROXIMITÉ'} : {topConflict.ac1.flight} ↔ {topConflict.ac2.flight} ({topConflict.currentDistNm.toFixed(1)} NM / {topConflict.currentAltDiffFt} FT)
                </span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  muteConflict(topConflict.id);
                }}
                className="h-6 px-2 rounded bg-red-950/80 hover:bg-red-800 text-red-200 border border-red-500/60 flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
                title="Désactiver manuellement cette alerte entre ces 2 appareils (Situation sous contrôle)"
              >
                ✕
              </button>
            </div>
          ) : (
            /* Coordonnées & Relèvement seuil quand pas de conflit */
            <div className="hidden md:flex items-center gap-3 text-radar-muted">
              <div className="flex items-center gap-1 bg-radar-surface px-2 py-0.5 rounded border border-radar-border">
                <MapPin className="w-3 h-3 text-radar-muted" />
                <span className="text-radar-green font-bold">{formatCoord(cursorLat, cursorLon)}</span>
              </div>

              <div className="flex items-center gap-1 bg-radar-surface px-2 py-0.5 rounded border border-radar-border">
                <Crosshair className="w-3 h-3 text-radar-cyan" />
                <span className="text-radar-cyan font-bold">{formatBra(braBearing, braDistanceNm)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Section Droite : Règle, Traînées, Menu Alertes, Source */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Règle rapide (Ruler) en NM par clic droit */}
          {rulerActive ? (
            <div className="flex items-center gap-1.5 bg-radar-surface px-2 py-0.5 rounded border border-radar-cyan text-radar-cyan font-bold text-[10px]">
              <span>📐 {rulerDist?.toFixed(1)} NM (CAP {rulerBearing !== null ? Math.round(rulerBearing) : 0}°)</span>
              <button
                onClick={clearRuler}
                className="text-red-400 hover:text-red-300 font-black px-1"
                title="Effacer la règle (ou touche Échap)"
              >
                ✕
              </button>
            </div>
          ) : (
            <div
              className="hidden lg:flex items-center gap-1 text-[10px] text-radar-muted bg-radar-surface px-2 py-0.5 rounded border border-radar-border/70"
              title="Faites un clic droit sur la carte pour mesurer la distance et le cap"
            >
              <span>📐 RÈGLE : CLIC DROIT</span>
            </div>
          )}

          {/* Quick Toggle Traînées d'Historique Radar */}
          <button
            onClick={() => {
              const next =
                trailLengthMode === 'off'
                  ? '1min'
                  : trailLengthMode === '1min'
                  ? '3min'
                  : trailLengthMode === '3min'
                  ? 'all'
                  : 'off';
              setTrailLengthMode(next);
            }}
            className={`h-6 px-2 rounded text-[10px] font-bold flex items-center gap-1 transition-colors border ${
              trailLengthMode !== 'off'
                ? 'bg-radar-surface border-radar-cyan text-radar-cyan'
                : 'bg-radar-surface border-radar-border text-radar-muted hover:text-white'
            }`}
            title="Traînées d'historique radar : OFF / 1 min / 3 min / Tout"
          >
            <Clock className="w-3 h-3" />
            <span>TRAÎNÉES: {trailLengthMode === 'off' ? 'OFF' : trailLengthMode === '1min' ? '1M' : trailLengthMode === '3min' ? '3M' : 'TOUT'}</span>
          </button>

          {/* Bouton Menu Alertes */}
          <button
            onClick={() => setAlertLogModalOpen(true)}
            className={`h-6 px-2 rounded text-[10px] font-bold flex items-center gap-1 transition-colors border shrink-0 ${
              conflicts.length > 0 || unreadAlertCount > 0
                ? 'bg-red-950/80 border-red-500 text-red-300 shadow-[0_0_8px_rgba(255,50,50,0.5)]'
                : 'bg-radar-surface border-radar-border text-radar-muted hover:text-radar-amber hover:border-radar-amber'
            }`}
            title="Ouvrir le journal des alertes ATC (STCA et Transpondeur)"
          >
            <AlertTriangle className={`w-3 h-3 ${conflicts.length > 0 ? 'text-red-400 animate-pulse' : ''}`} />
            <span>ALERTES</span>
            {unreadAlertCount > 0 && (
              <span className="px-1 py-0.2 bg-red-500 text-white rounded-full text-[8.5px] font-black">
                {unreadAlertCount}
              </span>
            )}
          </button>

          {/* Source de données */}
          <div className="flex items-center gap-1.5 border-l border-radar-border pl-2">
            <span
              className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold ${
                dataSource === 'adsbx'
                  ? 'bg-radar-cyan/20 text-radar-cyan border border-radar-cyan/40'
                  : 'bg-radar-green/20 text-radar-green border border-radar-green/40'
              }`}
            >
              {dataSource === 'adsbx' ? 'ADSBX' : 'LIVE'}
            </span>
          </div>
        </div>
      </footer>

      {/* Modal du Journal des Alertes ATC */}
      <AlertLogModal
        isOpen={alertLogModalOpen}
        onClose={() => setAlertLogModalOpen(false)}
      />
    </>
  );
};
