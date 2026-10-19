import React, { useState } from 'react';
import { Cloud, Wind, Thermometer, Info, ChevronDown } from 'lucide-react';
import { useRadarSettingsStore } from '../../store/useRadarSettingsStore';
import { useAirportStore } from '../../store/useAirportStore';
import { TRANSLATIONS } from '../../utils/i18n';
import { metarService } from '../../services/weather/metarService';

export const MetarWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const language = useRadarSettingsStore((state) => state.language);
  const metar = useRadarSettingsStore((state) => state.currentMetar);
  const currentAirport = useAirportStore((state) => state.currentAirport);
  const getActiveRunwayEnd = useAirportStore((state) => state.getActiveRunwayEnd);

  const t = TRANSLATIONS[language];
  const activeRunwayEnd = getActiveRunwayEnd();
  const rwyHdg = activeRunwayEnd?.heading || 0;

  if (!metar) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-radar-surface/60 border border-radar-border text-[11px] text-radar-muted">
        <Cloud className="w-3.5 h-3.5 animate-pulse" />
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

  return (
    <div className="relative">
      {/* Compact HUD Pill */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1 rounded bg-radar-surface border border-radar-border hover:border-radar-cyan text-[11px] font-mono transition-colors"
        title="Cliquer pour afficher le METAR complet"
      >
        <span className={`px-1 rounded text-[10px] font-bold border ${flightRulesColor}`}>
          {metar.flightRules || 'VFR'}
        </span>

        {/* Wind */}
        <div className="flex items-center gap-1 text-radar-cyan">
          <Wind className="w-3 h-3" />
          <span className="font-bold">
            {metar.windDir === 'VRB' ? 'VRB' : `${metar.windDir?.toString().padStart(3, '0')}°`}
            /{metar.windSpeedKt}kt
          </span>
        </div>

        {/* QNH */}
        <div className="text-radar-muted border-l border-radar-border pl-1.5 hidden md:block">
          QNH <strong className="text-radar-green">{metar.altimHpa || 1013}</strong>
        </div>

        {/* Temperature */}
        <div className="text-radar-muted hidden lg:block">
          {metar.tempC !== null && metar.tempC !== undefined ? `${metar.tempC}°C` : ''}
        </div>

        <ChevronDown className={`w-3 h-3 text-radar-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Expanded METAR Popover - 100% opaque, no transparency */}
      {isOpen && (
        <div
          style={{ backgroundColor: '#0a0f14', opacity: 1 }}
          className="absolute left-0 top-10 w-96 border-2 border-radar-cyan rounded p-3.5 shadow-[0_15px_50px_rgba(0,0,0,0.99)] z-[1100] text-xs font-mono space-y-2.5 select-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#1d352b] pb-2">
            <span className="font-bold text-radar-cyan flex items-center gap-1.5">
              <Cloud className="w-4 h-4" />
              {t.metarTitle} : {metar.icao}
            </span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${flightRulesColor}`}>
              {metar.flightRules}
            </span>
          </div>

          {/* Raw METAR String (Solid background) */}
          <div
            style={{ backgroundColor: '#101922' }}
            className="p-2 rounded border border-[#1d352b] text-[10px] text-radar-green font-mono break-all leading-relaxed"
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
                {metar.tempC}°C / PdR {metar.dewpC}°C
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
        </div>
      )}
    </div>
  );
};
