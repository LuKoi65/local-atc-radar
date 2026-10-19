import React, { useState, useEffect } from 'react';
import { Activity, Clock, Crosshair, MapPin } from 'lucide-react';
import { useTrafficStore } from '../../store/useTrafficStore';
import { useCursorStore } from '../../store/useCursorStore';
import { useAirportStore } from '../../store/useAirportStore';
import { useRadarSettingsStore } from '../../store/useRadarSettingsStore';
import { TRANSLATIONS } from '../../utils/i18n';

export const BottomBar: React.FC = () => {
  const [zuluTime, setZuluTime] = useState<string>('');

  const language = useRadarSettingsStore((state) => state.language);
  const t = TRANSLATIONS[language];

  const activeCount = useTrafficStore((state) => state.activeCount);
  const isPolling = useTrafficStore((state) => state.isPolling);
  const errorMessage = useTrafficStore((state) => state.errorMessage);

  const cursorLat = useCursorStore((state) => state.lat);
  const cursorLon = useCursorStore((state) => state.lon);
  const braBearing = useCursorStore((state) => state.braBearing);
  const braDistanceNm = useCursorStore((state) => state.braDistanceNm);

  const activeRunwayId = useAirportStore((state) => state.activeRunwayId);
  const dataSource = useRadarSettingsStore((state) => state.dataSource);

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

  // Format BRA string (Relèvement et Distance par rapport au seuil de piste)
  const formatBra = (bearing: number | null, dist: number | null) => {
    if (bearing === null || dist === null) return `${t.cursorBra} (RWY ${activeRunwayId}): ---° / --.- NM`;
    const bStr = Math.round(bearing).toString().padStart(3, '0');
    const dStr = dist.toFixed(1);
    return `${t.cursorBra} (RWY ${activeRunwayId}): ${bStr}° / ${dStr} NM`;
  };

  return (
    <footer className="h-8 bg-radar-panel border-t border-radar-border px-3 flex items-center justify-between z-30 select-none text-[11px] text-radar-green font-mono">
      {/* Left: UTC Zulu Clock & Refresh Rate Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-radar-cyan font-bold text-glow-cyan" title={t.zuluClock}>
          <Clock className="w-3.5 h-3.5" />
          <span>{zuluTime || '00:00:00 Z'}</span>
        </div>

        <div className="flex items-center gap-1.5 border-l border-radar-border pl-3">
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
          <div className="text-radar-alert font-bold border-l border-radar-border pl-3 animate-atc-blink">
            {t.warningFeed} : {errorMessage}
          </div>
        )}
      </div>

      {/* Center: Cursor Lat / Lon & BRA from Runway Threshold */}
      <div className="flex items-center gap-4 text-radar-muted">
        <div className="flex items-center gap-1 bg-radar-surface px-2 py-0.5 rounded border border-radar-border">
          <MapPin className="w-3 h-3 text-radar-muted" />
          <span className="text-radar-green font-bold">{formatCoord(cursorLat, cursorLon)}</span>
        </div>

        <div className="flex items-center gap-1 bg-radar-surface px-2 py-0.5 rounded border border-radar-border">
          <Crosshair className="w-3 h-3 text-radar-cyan" />
          <span className="text-radar-cyan font-bold">
            {formatBra(braBearing, braDistanceNm)}
          </span>
        </div>
      </div>

      {/* Right: Data Source Banner */}
      <div className="flex items-center gap-2">
        <span className="text-radar-muted text-[10px]">{t.source} :</span>
        <span
          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
            dataSource === 'adsbx'
              ? 'bg-radar-cyan/20 text-radar-cyan border border-radar-cyan/40'
              : 'bg-radar-green/20 text-radar-green border border-radar-green/40'
          }`}
        >
          {dataSource === 'adsbx' ? 'ADSBEXCHANGE' : 'AIRPLANES.LIVE DIRECT'}
        </span>
      </div>
    </footer>
  );
};
