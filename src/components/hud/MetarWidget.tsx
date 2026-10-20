import React, { useState, useRef, useEffect } from 'react';
import { Cloud, Wind, Thermometer, Info, ChevronDown, FileText, CalendarClock } from 'lucide-react';
import { useRadarSettingsStore } from '../../store/useRadarSettingsStore';
import { useAirportStore } from '../../store/useAirportStore';
import { TRANSLATIONS } from '../../utils/i18n';
import { metarService } from '../../services/weather/metarService';

export const MetarWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const language = useRadarSettingsStore((state) => state.language);
  const metar = useRadarSettingsStore((state) => state.currentMetar);
  const currentAirport = useAirportStore((state) => state.currentAirport);
  const getActiveRunwayEnd = useAirportStore((state) => state.getActiveRunwayEnd);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const t = TRANSLATIONS[language];
  const activeRunwayEnd = getActiveRunwayEnd();
  const rwyHdg = activeRunwayEnd?.heading || 0;

  if (!metar) {
    return (
      <div className="h-7 flex items-center gap-1.5 px-2 rounded bg-radar-surface/60 border border-radar-border text-[10px] text-radar-muted">
        <Cloud className="w-3 h-3 animate-pulse" />
        <span>METAR...</span>
      </div>
    );
  }

  // Calculate crosswind and headwind relative to the active runway
  const windComp = metarService.calculateWindComponents(
    metar.windDir,
    metar.windSpeedKt,
    rwyHdg
  );

  const flightRulesColor =
    metar.flightRules === 'VFR'
      ? 'bg-radar-green/20 text-radar-green border-radar-green/40'
      : metar.flightRules === 'MVFR'
      ? 'bg-radar-cyan/20 text-radar-cyan border-radar-cyan/40'
      : 'bg-radar-alert/20 text-radar-alert border-radar-alert/40';

  // Format TAF validity dates
  const formatTafTime = (timestamp?: number | null) => {
    if (!timestamp) return null;
    const d = new Date(timestamp * 1000);
    const day = d.getUTCDate().toString().padStart(2, '0');
    const hour = d.getUTCHours().toString().padStart(2, '0');
    return `${day}/${hour}Z`;
  };

  const taf = metar.taf;

  return (
    <div className="relative" ref={containerRef}>
      {/* Compact HUD Pill - Unified h-7 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-7 flex items-center gap-1.5 px-2 rounded bg-radar-surface border border-radar-border hover:border-radar-cyan text-[10px] font-mono transition-colors shrink-0"
        title="Cliquer pour afficher le METAR et le TAF complet"
      >
        <span className={`px-1 py-0.5 rounded text-[9px] font-bold border leading-none ${flightRulesColor}`}>
          {metar.flightRules || 'VFR'}
        </span>

        {/* Wind */}
        <div className="flex items-center gap-1 text-radar-cyan font-bold">
          <Wind className="w-3 h-3" />
          <span>
            {metar.windDir === 'VRB' ? 'VRB' : `${metar.windDir?.toString().padStart(3, '0')}°`}
            /{metar.windSpeedKt}kt
          </span>
        </div>

        {/* QNH */}
        <div className="text-radar-muted border-l border-radar-border pl-1.5 hidden md:block text-[10px]">
          QNH <strong className="text-radar-green">{metar.altimHpa || 1013}</strong>
        </div>

        {/* Temperature */}
        <div className="text-radar-muted hidden lg:block text-[10px]">
          {metar.tempC !== null && metar.tempC !== undefined ? `${metar.tempC}°C` : ''}
        </div>

        <ChevronDown className={`w-3 h-3 text-radar-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Expanded METAR & TAF Popover - 100% opaque, no transparency */}
      {isOpen && (
        <div
          style={{ backgroundColor: '#0a0f14', opacity: 1 }}
          className="absolute left-0 top-full mt-1.5 w-[420px] max-h-[85vh] overflow-y-auto border-2 border-radar-cyan rounded p-3.5 shadow-[0_15px_50px_rgba(0,0,0,0.99)] z-[1500] text-xs font-mono space-y-3 select-none"
        >
          {/* Header METAR */}
          <div className="flex items-center justify-between border-b border-[#1d352b] pb-2">
            <span className="font-bold text-radar-cyan flex items-center gap-1.5 text-xs">
              <Cloud className="w-4 h-4" />
              {t.metarTitle} : {metar.icao}
            </span>
            <div className="flex items-center gap-1.5">
              {metar.time && (
                <span className="text-[10px] text-radar-muted">
                  {metar.time.slice(11, 16)}Z
                </span>
              )}
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${flightRulesColor}`}>
                {metar.flightRules}
              </span>
            </div>
          </div>

          {/* Raw METAR String (Solid background) */}
          <div
            style={{ backgroundColor: '#101922' }}
            className="p-2.5 rounded border border-[#1d352b] text-[10.5px] text-radar-green font-mono break-all leading-relaxed select-text"
          >
            {metar.raw}
          </div>

          {/* Decoded Weather Elements (Solid background cards) */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {/* Wind */}
            <div style={{ backgroundColor: '#101922' }} className="p-2 rounded border border-[#1d352b]">
              <div className="text-radar-muted text-[10px] flex items-center gap-1">
                <Wind className="w-3 h-3 text-radar-cyan" />
                <span>{t.wind.toUpperCase()}</span>
              </div>
              <div className="font-bold text-radar-green mt-0.5">
                {metar.windDir}° à {metar.windSpeedKt} kts
              </div>
              <div className="text-[9px] text-radar-muted mt-0.5">
                {windComp.headwindKt >= 0
                  ? `${t.headwind}: ${windComp.headwindKt} kt`
                  : `${t.tailwind}: ${Math.abs(windComp.headwindKt)} kt`}
                {' • '}
                {t.crosswind}: {windComp.crosswindKt} kt {windComp.crosswindSide}
              </div>
            </div>

            {/* QNH Altimeter */}
            <div style={{ backgroundColor: '#101922' }} className="p-2 rounded border border-[#1d352b]">
              <div className="text-radar-muted text-[10px]">QNH ALTIMÈTRE</div>
              <div className="font-bold text-radar-green mt-0.5">
                {metar.altimHpa} hPa
              </div>
              <div className="text-[9px] text-radar-muted mt-0.5">
                {metar.altimHpa ? `${(metar.altimHpa * 0.02953).toFixed(2)} inHg` : ''}
              </div>
            </div>

            {/* Temperature & Dewpoint */}
            <div style={{ backgroundColor: '#101922' }} className="p-2 rounded border border-[#1d352b]">
              <div className="text-radar-muted text-[10px] flex items-center gap-1">
                <Thermometer className="w-3 h-3 text-radar-amber" />
                <span>TEMPÉRATURE</span>
              </div>
              <div className="font-bold text-radar-green mt-0.5">
                {metar.tempC !== null && metar.tempC !== undefined ? `${metar.tempC}°C` : '--'} / PdR{' '}
                {metar.dewpC !== null && metar.dewpC !== undefined ? `${metar.dewpC}°C` : '--'}
              </div>
            </div>

            {/* Clouds / Ceiling */}
            <div style={{ backgroundColor: '#101922' }} className="p-2 rounded border border-[#1d352b]">
              <div className="text-radar-muted text-[10px] flex items-center gap-1">
                <Cloud className="w-3 h-3 text-radar-cyan" />
                <span>NÉBULOSITÉ</span>
              </div>
              <div className="font-bold text-radar-green mt-0.5 text-[10px]">
                {metar.clouds && metar.clouds.length > 0
                  ? metar.clouds.map((c) => `${c.cover} ${c.base}ft`).join(', ')
                  : 'CAVOK / Dégagé'}
              </div>
            </div>
          </div>

          {/* SECTION TAF (PRÉVISIONS D'AÉRODROME) */}
          <div className="border-t border-[#1d352b] pt-2.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-radar-cyan flex items-center gap-1.5 text-xs">
                <FileText className="w-4 h-4 text-radar-cyan" />
                TAF (PRÉVISIONS D'AÉRODROME)
              </span>
              {taf?.validTimeFrom && taf?.validTimeTo && (
                <span className="bg-radar-cyan/15 text-radar-cyan border border-radar-cyan/30 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold flex items-center gap-1">
                  <CalendarClock className="w-2.5 h-2.5" />
                  VALIDE : {formatTafTime(taf.validTimeFrom)} → {formatTafTime(taf.validTimeTo)}
                </span>
              )}
            </div>

            {taf?.rawTAF ? (
              <div className="space-y-2">
                {/* Raw TAF text with highlighted operational blocks */}
                <div
                  style={{ backgroundColor: '#101922' }}
                  className="p-2.5 rounded border border-[#1d352b] text-[10.5px] text-radar-green font-mono break-words leading-relaxed whitespace-pre-wrap select-text"
                >
                  {taf.rawTAF}
                </div>

                {/* Structured Forecast Evolution periods */}
                {taf.fcsts && taf.fcsts.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-[10px] text-radar-muted font-bold uppercase tracking-wider">
                      Évolutions prévues ({taf.fcsts.length})
                    </div>
                    <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                      {taf.fcsts.map((fc, idx) => (
                        <div
                          key={idx}
                          style={{ backgroundColor: '#101922' }}
                          className="p-1.5 rounded border border-radar-border text-[10px] flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-1 py-0.2 rounded font-bold text-[9px] ${
                                fc.change === 'TEMPO'
                                  ? 'bg-radar-amber/20 text-radar-amber border border-radar-amber/40'
                                  : fc.change === 'BECMG'
                                  ? 'bg-radar-cyan/20 text-radar-cyan border border-radar-cyan/40'
                                  : 'bg-radar-green/20 text-radar-green border border-radar-green/40'
                              }`}
                            >
                              {fc.change || (idx === 0 ? 'BASE' : 'FM')}
                              {fc.probability ? ` ${fc.probability}%` : ''}
                            </span>
                            <span className="text-radar-muted font-mono">
                              {formatTafTime(fc.fcstTimeFrom)} → {formatTafTime(fc.fcstTimeTo)}
                            </span>
                          </div>

                          <div className="text-right text-radar-green font-mono truncate">
                            {fc.wdir !== undefined && fc.wspd !== undefined && (
                              <span>
                                {fc.wdir === 'VRB' ? 'VRB' : `${fc.wdir}°`}/{fc.wspd}kt{' '}
                              </span>
                            )}
                            {fc.wxString && (
                              <span className="text-radar-amber font-bold">{fc.wxString} </span>
                            )}
                            {fc.clouds && fc.clouds.length > 0 && (
                              <span className="text-radar-cyan">
                                {fc.clouds.map((c) => `${c.cover}${c.base}`).join(' ')}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div
                style={{ backgroundColor: '#101922' }}
                className="p-2.5 rounded border border-radar-border/60 text-[10px] text-radar-muted text-center"
              >
                Aucune prévision TAF publiée pour {metar.icao} (aérodrome non pourvu de station météo 24h).
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
