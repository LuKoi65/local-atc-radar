import React, { useState, useRef, useEffect } from 'react';
import {
  Compass,
  Radio,
  Sliders,
  Maximize2,
  Layers,
  CircleDot,
  PlusCircle,
  Clock,
  Filter,
  Shield,
  Navigation,
  MapPin,
  Route,
  Sparkles,
  Radar,
  Crosshair,
  Headphones,
  Plane,
  ChevronDown,
  X,
} from 'lucide-react';
import { useAirportStore } from '../../store/useAirportStore';
import {
  useRadarSettingsStore,
  VectorLengthMinutes,
  MapMode,
  DeclutterLevel,
} from '../../store/useRadarSettingsStore';
import { TRANSLATIONS } from '../../utils/i18n';
import { MetarWidget } from './MetarWidget';
import { AltitudeFilterWidget } from './AltitudeFilterWidget';

interface TopBarProps {
  onOpenSettings: () => void;
  onOpenCustomAirport: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenSettings,
  onOpenCustomAirport,
}) => {
  const language = useRadarSettingsStore((state) => state.language);
  const setLanguage = useRadarSettingsStore((state) => state.setLanguage);
  const t = TRANSLATIONS[language];

  const airports = useAirportStore((state) => state.airports);
  const currentAirport = useAirportStore((state) => state.currentAirport);
  const activeRunwayId = useAirportStore((state) => state.activeRunwayId);
  const selectAirport = useAirportStore((state) => state.selectAirport);
  const setActiveRunway = useAirportStore((state) => state.setActiveRunway);

  const dataSource = useRadarSettingsStore((state) => state.dataSource);
  const setDataSource = useRadarSettingsStore((state) => state.setDataSource);
  const mapMode = useRadarSettingsStore((state) => state.mapMode);
  const setMapMode = useRadarSettingsStore((state) => state.setMapMode);
  const vectorLengthMin = useRadarSettingsStore((state) => state.vectorLengthMin);
  const setVectorLengthMin = useRadarSettingsStore((state) => state.setVectorLengthMin);
  const triggerCenter = useRadarSettingsStore((state) => state.triggerCenter);
  const detectionRangeNm = useRadarSettingsStore((state) => state.detectionRangeNm);
  const setDetectionRangeNm = useRadarSettingsStore((state) => state.setDetectionRangeNm);
  const declutterLevel = useRadarSettingsStore((state) => state.declutterLevel);
  const setDeclutterLevel = useRadarSettingsStore((state) => state.setDeclutterLevel);

  // Aeronautical layer toggles
  const showAirspaces = useRadarSettingsStore((state) => state.showAirspaces);
  const setShowAirspaces = useRadarSettingsStore((state) => state.setShowAirspaces);
  const showNavaids = useRadarSettingsStore((state) => state.showNavaids);
  const setShowNavaids = useRadarSettingsStore((state) => state.setShowNavaids);
  const showWaypoints = useRadarSettingsStore((state) => state.showWaypoints);
  const setShowWaypoints = useRadarSettingsStore((state) => state.setShowWaypoints);
  const showStars = useRadarSettingsStore((state) => state.showStars);
  const setShowStars = useRadarSettingsStore((state) => state.setShowStars);

  // Aeronautical layers dropdown menu
  const [layersMenuOpen, setLayersMenuOpen] = useState(false);
  const layersMenuRef = useRef<HTMLDivElement>(null);
  const activeLayersCount = [showAirspaces, showNavaids, showWaypoints, showStars].filter(Boolean).length;

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (layersMenuRef.current && !layersMenuRef.current.contains(e.target as Node)) {
        setLayersMenuOpen(false);
      }
    };
    if (layersMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [layersMenuOpen]);

  // Lateral Sidebars & GPS
  const vhfSidebarOpen = useRadarSettingsStore((state) => state.vhfSidebarOpen);
  const setVhfSidebarOpen = useRadarSettingsStore((state) => state.setVhfSidebarOpen);
  const flightsSidebarOpen = useRadarSettingsStore((state) => state.flightsSidebarOpen);
  const setFlightsSidebarOpen = useRadarSettingsStore((state) => state.setFlightsSidebarOpen);
  const showUserLocation = useRadarSettingsStore((state) => state.showUserLocation);
  const setShowUserLocation = useRadarSettingsStore((state) => state.setShowUserLocation);

  const availableRunwayEnds = currentAirport.runways.flatMap((r) => [r.end1, r.end2]);

  return (
    <header className="h-11 bg-radar-panel border-b border-radar-border px-2 flex items-center justify-between relative z-[1000] select-none text-[11px] text-radar-green font-mono gap-1.5">
      {/* Section Gauche : Aérodrome, Pistes, METAR */}
      <div className="flex items-center gap-1.5 shrink-0">
        <div className="h-7 flex items-center gap-1.5 font-bold text-radar-cyan border-r border-radar-border pr-2 shrink-0">
          <img
            src="/icon.png"
            alt="Local ATC Radar"
            className="w-4 h-4 object-contain shrink-0 drop-shadow-[0_0_6px_rgba(0,255,102,0.6)]"
          />
          <span className="tracking-wider font-extrabold text-radar-green text-[10px] whitespace-nowrap">
            {t.appTitle}
          </span>
        </div>

        {/* Sélecteur d'aérodrome (compact avec icône avion - Unified h-7) */}
        <div className="h-7 flex items-center gap-1 bg-radar-surface px-2 rounded border border-radar-border shrink-0">
          <Plane className="w-3 h-3 text-radar-cyan shrink-0" />
          <select
            value={currentAirport.icao}
            onChange={(e) => selectAirport(e.target.value)}
            className="bg-transparent font-bold text-radar-green text-[10px] focus:outline-none cursor-pointer"
          >
            {airports.map((apt) => (
              <option key={apt.icao} value={apt.icao} className="bg-radar-panel text-radar-green">
                {apt.icao} - {apt.city}
              </option>
            ))}
          </select>
        </div>

        {/* Sélecteur de piste en service - Unified h-7 */}
        <div className="h-7 flex items-center gap-1 bg-radar-surface p-0.5 rounded border border-radar-border shrink-0">
          <span className="text-radar-muted font-bold text-[9px] px-1">RWY</span>
          <div className="flex items-center h-full gap-0.5">
            {availableRunwayEnds.map((rend) => {
              const isActive = rend.id === activeRunwayId;
              return (
                <button
                  key={rend.id}
                  onClick={() => setActiveRunway(rend.id)}
                  className={`h-full px-1.5 rounded text-[10px] font-bold transition-colors flex items-center justify-center ${
                    isActive
                      ? 'bg-radar-green text-radar-bg font-extrabold shadow-radar-green'
                      : 'text-radar-green hover:bg-radar-border'
                  }`}
                  title={`Piste ${rend.id} (Cap ${rend.heading}°)`}
                >
                  {rend.id}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bouton Nouvel Aérodrome - Unified h-7 w-7 */}
        <button
          onClick={onOpenCustomAirport}
          className="h-7 w-7 flex items-center justify-center rounded bg-radar-surface border border-radar-border text-radar-muted hover:text-radar-cyan hover:border-radar-cyan transition-colors shrink-0"
          title={t.addCustomAirport}
        >
          <PlusCircle className="w-3.5 h-3.5" />
        </button>

        {/* METAR Widget Météo Aérodrome */}
        <MetarWidget />
      </div>

      {/* Section Centre : Source, Portée, Déclutter & Filtres */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Source de données (LIVE / ADSBx) - Unified h-7 */}
        <div className="h-7 flex items-center bg-radar-surface rounded border border-radar-border p-0.5 shrink-0 gap-0.5">
          <button
            onClick={() => setDataSource('live')}
            className={`h-full px-2 rounded text-[10px] font-bold flex items-center gap-1 transition-colors ${
              dataSource === 'live'
                ? 'bg-radar-green text-radar-bg font-extrabold'
                : 'text-radar-muted hover:text-radar-green'
            }`}
            title="Flux Direct ADSB (Local / Réseau)"
          >
            <Radio className="w-2.5 h-2.5" />
            LIVE
          </button>
          <button
            onClick={() => setDataSource('adsbx')}
            className={`h-full px-2 rounded text-[10px] font-bold flex items-center transition-colors ${
              dataSource === 'adsbx'
                ? 'bg-radar-cyan text-radar-bg font-extrabold'
                : 'text-radar-muted hover:text-radar-cyan'
            }`}
            title="Flux ADSBx Proxy"
          >
            ADSBx
          </button>
        </div>

        {/* Sélecteur de Portée Radar - Unified h-7 */}
        <div className="h-7 flex items-center gap-1 bg-radar-surface px-2 rounded border border-radar-border shrink-0" title={t.range}>
          <Radar className="w-3 h-3 text-radar-cyan shrink-0" />
          <select
            value={detectionRangeNm}
            onChange={(e) => setDetectionRangeNm(Number(e.target.value))}
            className="bg-transparent font-bold text-radar-cyan text-[10px] focus:outline-none cursor-pointer"
          >
            <option value={30} className="bg-radar-panel text-radar-green">30 NM</option>
            <option value={50} className="bg-radar-panel text-radar-green">50 NM</option>
            <option value={75} className="bg-radar-panel text-radar-green">75 NM</option>
            <option value={100} className="bg-radar-panel text-radar-green">100 NM</option>
            <option value={150} className="bg-radar-panel text-radar-green">150 NM</option>
          </select>
        </div>

        {/* Bouton Déclutter (Épuré / Min / Norm) - Unified h-7 */}
        <button
          onClick={() => {
            const next: DeclutterLevel =
              declutterLevel === 'normal'
                ? 'clean'
                : declutterLevel === 'clean'
                ? 'minimal'
                : 'normal';
            setDeclutterLevel(next);
          }}
          className="h-7 flex items-center gap-1.5 px-2 rounded bg-radar-surface border border-radar-border text-radar-cyan hover:border-radar-cyan transition-colors text-[10px] font-bold shrink-0"
          title="Niveau de désencombrement / Déclutter"
        >
          <Sparkles className="w-2.5 h-2.5 text-radar-cyan" />
          <span>
            {declutterLevel === 'clean'
              ? 'ÉPURÉ'
              : declutterLevel === 'minimal'
              ? 'MIN'
              : 'NORM'}
          </span>
        </button>

        {/* Filtre Altitude Terminale (Double Slider Fusionné) */}
        <AltitudeFilterWidget />

        {/* Durée du vecteur vitesse (1 / 2 / 3 min) - Unified h-7 */}
        <div className="h-7 flex items-center gap-0.5 bg-radar-surface p-0.5 rounded border border-radar-border shrink-0" title={t.vector}>
          <Clock className="w-2.5 h-2.5 text-radar-muted shrink-0 mx-1" />
          {([1, 2, 3] as VectorLengthMinutes[]).map((m) => (
            <button
              key={m}
              onClick={() => setVectorLengthMin(m)}
              className={`h-full px-1.5 rounded text-[10px] font-bold transition-colors flex items-center justify-center ${
                vectorLengthMin === m
                  ? 'bg-radar-cyan text-radar-bg font-extrabold'
                  : 'text-radar-muted hover:text-radar-cyan'
              }`}
            >
              {m}m
            </button>
          ))}
        </div>
      </div>

      {/* Section Droite : Sous-menu Calques, Fond de Carte & Outils */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Sous-menu Calques Aéronautiques - Unified h-7 */}
        <div className="relative" ref={layersMenuRef}>
          <button
            onClick={() => setLayersMenuOpen(!layersMenuOpen)}
            className={`h-7 px-2 rounded text-[10px] font-bold flex items-center gap-1.5 border transition-colors shrink-0 ${
              activeLayersCount > 0
                ? 'bg-radar-surface border-radar-cyan text-radar-cyan shadow-[0_0_8px_rgba(0,229,255,0.2)]'
                : 'bg-radar-surface border-radar-border text-radar-muted hover:text-radar-green'
            }`}
            title="Afficher/Masquer les calques aéronautiques"
          >
            <Layers className="w-3 h-3" />
            <span>CALQUES</span>
            <span className="bg-radar-cyan/20 text-radar-cyan text-[8px] px-1 rounded-sm border border-radar-cyan/40">
              {activeLayersCount}/4
            </span>
            <ChevronDown className={`w-3 h-3 text-radar-muted transition-transform ${layersMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Popover Calques - Opaque z-[1500] */}
          {layersMenuOpen && (
            <div
              style={{ backgroundColor: '#0a0f14', opacity: 1 }}
              className="absolute right-0 top-full mt-1.5 w-60 border border-radar-cyan/60 rounded-md shadow-[0_15px_50px_rgba(0,0,0,0.99)] p-2.5 z-[1500] font-mono text-radar-green select-none space-y-1.5"
            >
              <div className="flex items-center justify-between pb-1.5 border-b border-radar-border text-[10px] font-bold text-radar-cyan">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  CALQUES AÉRONAUTIQUES
                </span>
                <button
                  onClick={() => setLayersMenuOpen(false)}
                  className="text-radar-muted hover:text-radar-cyan p-0.5 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 1. CTR / Airspaces */}
              <button
                onClick={() => setShowAirspaces(!showAirspaces)}
                className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-[10px] font-bold border transition-colors ${
                  showAirspaces
                    ? 'bg-radar-cyan/20 border-radar-cyan text-radar-cyan'
                    : 'bg-radar-surface border-radar-border text-radar-muted hover:text-radar-cyan'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3 h-3" />
                  Espaces (CTR/TMA)
                </span>
                <span className={`text-[9px] px-1 rounded ${showAirspaces ? 'bg-radar-cyan text-radar-bg font-bold' : 'text-radar-muted'}`}>
                  {showAirspaces ? 'ACTIF' : 'OFF'}
                </span>
              </button>

              {/* 2. VOR / Navaids */}
              <button
                onClick={() => setShowNavaids(!showNavaids)}
                className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-[10px] font-bold border transition-colors ${
                  showNavaids
                    ? 'bg-radar-cyan/20 border-radar-cyan text-radar-cyan'
                    : 'bg-radar-surface border-radar-border text-radar-muted hover:text-radar-cyan'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Navigation className="w-3 h-3" />
                  Balises VOR / NDB
                </span>
                <span className={`text-[9px] px-1 rounded ${showNavaids ? 'bg-radar-cyan text-radar-bg font-bold' : 'text-radar-muted'}`}>
                  {showNavaids ? 'ACTIF' : 'OFF'}
                </span>
              </button>

              {/* 3. Points / Waypoints */}
              <button
                onClick={() => setShowWaypoints(!showWaypoints)}
                className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-[10px] font-bold border transition-colors ${
                  showWaypoints
                    ? 'bg-radar-green/20 border-radar-green text-radar-green'
                    : 'bg-radar-surface border-radar-border text-radar-muted hover:text-radar-green'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" />
                  Points de Report (FIX)
                </span>
                <span className={`text-[9px] px-1 rounded ${showWaypoints ? 'bg-radar-green text-radar-bg font-bold' : 'text-radar-muted'}`}>
                  {showWaypoints ? 'ACTIF' : 'OFF'}
                </span>
              </button>

              {/* 4. STARS */}
              <button
                onClick={() => setShowStars(!showStars)}
                className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-[10px] font-bold border transition-colors ${
                  showStars
                    ? 'bg-radar-green/20 border-radar-green text-radar-green'
                    : 'bg-radar-surface border-radar-border text-radar-muted hover:text-radar-green'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Route className="w-3 h-3" />
                  Procédures STAR
                </span>
                <span className={`text-[9px] px-1 rounded ${showStars ? 'bg-radar-green text-radar-bg font-bold' : 'text-radar-muted'}`}>
                  {showStars ? 'ACTIF' : 'OFF'}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Sélecteur de Fond de Carte (Pure, OSM, OpenAIP) - Unified h-7 */}
        <select
          value={mapMode}
          onChange={(e) => setMapMode(e.target.value as MapMode)}
          className="h-7 bg-radar-surface border border-radar-border rounded px-2 text-[10px] font-bold text-radar-green focus:outline-none cursor-pointer shrink-0"
        >
          <option value="pure" className="bg-radar-panel text-radar-green">PUR</option>
          <option value="osm-dark" className="bg-radar-panel text-radar-green">OSM</option>
          <option value="openaip" className="bg-radar-panel text-radar-cyan">OPENAIP</option>
        </select>

        {/* Boutons des Tiroirs Latéraux (VHF, Vols & GPS) - Unified h-7 */}
        <div className="h-7 flex items-center gap-0.5 bg-radar-surface p-0.5 rounded border border-radar-border shrink-0">
          {/* Bouton Fréquences VHF ATC */}
          <button
            onClick={() => setVhfSidebarOpen(!vhfSidebarOpen)}
            className={`h-full px-2 rounded text-[10px] font-bold flex items-center gap-1 transition-colors ${
              vhfSidebarOpen
                ? 'bg-radar-cyan text-radar-bg border border-radar-cyan font-extrabold shadow-radar-cyan'
                : 'text-radar-muted hover:text-radar-cyan'
            }`}
            title="Afficher/Masquer le panneau des Fréquences Radio VHF"
          >
            <Headphones className="w-3 h-3" />
            <span>VHF</span>
          </button>

          {/* Bouton Tableau des Vols */}
          <button
            onClick={() => setFlightsSidebarOpen(!flightsSidebarOpen)}
            className={`h-full px-2 rounded text-[10px] font-bold flex items-center gap-1 transition-colors ${
              flightsSidebarOpen
                ? 'bg-radar-green text-radar-bg border border-radar-green font-extrabold shadow-radar-green'
                : 'text-radar-muted hover:text-radar-green'
            }`}
            title="Afficher/Masquer le tableau des vols (Arrivées & Départs)"
          >
            <Plane className="w-3 h-3" />
            <span>VOLS</span>
          </button>

          {/* Bouton Localisation GPS */}
          <button
            onClick={() => setShowUserLocation(!showUserLocation)}
            className={`h-full px-2 rounded text-[10px] font-bold flex items-center gap-1 transition-colors ${
              showUserLocation
                ? 'bg-radar-cyan text-radar-bg border border-radar-cyan font-extrabold shadow-radar-cyan'
                : 'text-radar-muted hover:text-radar-cyan'
            }`}
            title={showUserLocation ? 'Masquer ma position GPS' : 'Afficher ma position GPS sur le radar'}
          >
            <Crosshair className="w-3 h-3" />
            <span>GPS</span>
          </button>
        </div>

        {/* Actions Rapides : Recentrer, Langue, Paramètres - Unified h-7 */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Bouton Recentrer */}
          <button
            onClick={triggerCenter}
            className="h-7 w-7 flex items-center justify-center rounded bg-radar-surface border border-radar-border text-radar-muted hover:text-radar-green hover:border-radar-green transition-colors shrink-0"
            title={t.recenter}
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          {/* Sélecteur de Langue rapide */}
          <button
            onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
            className="h-7 px-2 flex items-center justify-center rounded bg-radar-surface border border-radar-border text-[10px] font-bold text-radar-cyan hover:border-radar-cyan transition-colors shrink-0"
            title="Changer la langue / Switch language"
          >
            {language.toUpperCase()}
          </button>

          {/* Bouton Paramètres */}
          <button
            onClick={onOpenSettings}
            className="h-7 w-7 flex items-center justify-center rounded bg-radar-surface border border-radar-border text-radar-muted hover:text-radar-cyan hover:border-radar-cyan transition-colors shrink-0"
            title={t.settings}
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
