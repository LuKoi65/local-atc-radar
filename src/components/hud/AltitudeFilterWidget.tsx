import React, { useState, useRef, useEffect } from 'react';
import { Filter, X, Check, ArrowRight, RotateCcw } from 'lucide-react';
import { useRadarSettingsStore } from '../../store/useRadarSettingsStore';

const MAX_ALT_LIMIT = 45000;

export const AltitudeFilterWidget: React.FC = () => {
  const {
    filterEnabled,
    altitudeFilterMin,
    altitudeFilterMax,
    setAltitudeFilter,
  } = useRadarSettingsStore();

  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
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

  const handleMinChange = (val: number) => {
    const newMin = Math.min(val, altitudeFilterMax);
    setAltitudeFilter(newMin, altitudeFilterMax, true);
  };

  const handleMaxChange = (val: number) => {
    const newMax = Math.max(val, altitudeFilterMin);
    setAltitudeFilter(altitudeFilterMin, newMax, true);
  };

  const formatAltText = (alt: number) => {
    if (alt === 0) return '0 ft (Sol)';
    const fl = Math.round(alt / 100);
    return `FL${fl.toString().padStart(3, '0')} (${alt.toLocaleString()} ft)`;
  };

  const setPreset = (min: number, max: number, enable: boolean = true) => {
    setAltitudeFilter(min, max, enable);
  };

  // Percentage calculations for slider visual band
  const minPercent = (altitudeFilterMin / MAX_ALT_LIMIT) * 100;
  const maxPercent = (altitudeFilterMax / MAX_ALT_LIMIT) * 100;

  return (
    <div className="relative inline-block" ref={popoverRef}>
      {/* Trigger Button in TopBar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2 py-1 rounded border text-[11px] font-bold transition-all ${
          filterEnabled
            ? 'bg-[#291b0c] border-radar-amber text-radar-amber shadow-[0_0_8px_rgba(255,170,0,0.3)]'
            : 'bg-radar-surface border-radar-border text-radar-muted hover:text-radar-green hover:border-radar-green/50'
        }`}
        title="Filtrer l'altitude du trafic radar"
      >
        <Filter className={`w-3.5 h-3.5 ${filterEnabled ? 'text-radar-amber animate-pulse' : 'text-radar-muted'}`} />
        <span>
          {filterEnabled
            ? `FL${Math.round(altitudeFilterMin / 100)} ↔ FL${Math.round(altitudeFilterMax / 100)}`
            : 'ALT : TOUS'}
        </span>
      </button>

      {/* Popover Card */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-80 bg-[#0a0f14] border border-radar-cyan/60 rounded-md shadow-2xl p-3 z-[1100] font-mono text-radar-green select-none">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-radar-border mb-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-radar-cyan" />
              <span className="font-bold text-radar-cyan text-xs tracking-wider">
                FILTRE D'ALTITUDE (SLIDER)
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-radar-muted hover:text-radar-cyan p-0.5 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Enable / Disable Switch */}
          <div className="flex items-center justify-between bg-radar-surface/80 p-2 rounded border border-radar-border mb-3">
            <span className="text-xs font-bold text-white">Activer le filtre</span>
            <button
              onClick={() => setAltitudeFilter(altitudeFilterMin, altitudeFilterMax, !filterEnabled)}
              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                filterEnabled
                  ? 'bg-radar-amber text-radar-bg shadow-[0_0_8px_rgba(255,170,0,0.4)]'
                  : 'bg-radar-panel text-radar-muted border border-radar-border'
              }`}
            >
              {filterEnabled ? 'FILTRE ACTIF' : 'DÉSACTIVÉ'}
            </button>
          </div>

          {/* Current Range Readout */}
          <div className="bg-radar-panel p-2.5 rounded border border-radar-border mb-3 text-center">
            <div className="text-[10px] text-radar-muted uppercase tracking-wider mb-1">
              Plage d'altitude sélectionnée
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-radar-cyan">
              <span>{formatAltText(altitudeFilterMin)}</span>
              <ArrowRight className="w-3.5 h-3.5 text-radar-amber" />
              <span>{formatAltText(altitudeFilterMax)}</span>
            </div>
          </div>

          {/* Double Range Sliders */}
          <div className="space-y-3 mb-4 px-1">
            {/* Visual range track */}
            <div className="relative w-full h-2 bg-radar-surface rounded overflow-hidden">
              <div
                className="absolute top-0 bottom-0 bg-gradient-to-r from-radar-cyan via-radar-green to-radar-amber rounded"
                style={{
                  left: `${minPercent}%`,
                  width: `${Math.max(2, maxPercent - minPercent)}%`,
                }}
              />
            </div>

            {/* Slider 1: Min Altitude */}
            <div>
              <div className="flex justify-between text-[10px] text-radar-muted mb-1">
                <span>Altitude Minimum :</span>
                <span className="font-bold text-radar-cyan">
                  {altitudeFilterMin === 0 ? '0 ft (Sol)' : `${altitudeFilterMin.toLocaleString()} ft`}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={MAX_ALT_LIMIT}
                step={500}
                value={altitudeFilterMin}
                onChange={(e) => handleMinChange(Number(e.target.value))}
                className="w-full h-1.5 bg-radar-surface rounded-lg appearance-none cursor-pointer accent-radar-cyan"
              />
            </div>

            {/* Slider 2: Max Altitude */}
            <div>
              <div className="flex justify-between text-[10px] text-radar-muted mb-1">
                <span>Altitude Maximum :</span>
                <span className="font-bold text-radar-amber">
                  {altitudeFilterMax >= MAX_ALT_LIMIT
                    ? `${MAX_ALT_LIMIT.toLocaleString()} ft (Max)`
                    : `${altitudeFilterMax.toLocaleString()} ft`}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={MAX_ALT_LIMIT}
                step={500}
                value={altitudeFilterMax}
                onChange={(e) => handleMaxChange(Number(e.target.value))}
                className="w-full h-1.5 bg-radar-surface rounded-lg appearance-none cursor-pointer accent-radar-amber"
              />
            </div>
          </div>

          {/* Quick Presets */}
          <div className="space-y-1.5 pt-2 border-t border-radar-border">
            <div className="text-[10px] text-radar-muted font-bold uppercase tracking-wider mb-1">
              Préréglages rapides :
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              <button
                onClick={() => setPreset(0, 10000)}
                className="p-1 rounded bg-radar-surface hover:bg-radar-panel border border-radar-border hover:border-radar-cyan text-white text-left transition-colors"
              >
                Approche (0-FL100)
              </button>
              <button
                onClick={() => setPreset(0, 15000)}
                className="p-1 rounded bg-radar-surface hover:bg-radar-panel border border-radar-border hover:border-radar-cyan text-white text-left transition-colors"
              >
                Terminal (0-FL150)
              </button>
              <button
                onClick={() => setPreset(10000, 25000)}
                className="p-1 rounded bg-radar-surface hover:bg-radar-panel border border-radar-border hover:border-radar-cyan text-white text-left transition-colors"
              >
                Moyen (FL100-250)
              </button>
              <button
                onClick={() => setPreset(25000, 45000)}
                className="p-1 rounded bg-radar-surface hover:bg-radar-panel border border-radar-border hover:border-radar-cyan text-white text-left transition-colors"
              >
                Croisière (FL250+)
              </button>
            </div>

            <button
              onClick={() => setPreset(0, 45000, false)}
              className="w-full mt-1.5 py-1 rounded bg-radar-surface/50 hover:bg-radar-surface border border-radar-border hover:border-radar-green text-radar-muted hover:text-radar-green text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Afficher tout le trafic (Désactiver filtre)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
