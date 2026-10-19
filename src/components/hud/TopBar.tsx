import React from 'react';
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
  TableProperties,
  Sparkles,
  Radar,
  Languages,
  Crosshair,
  Headphones,
  Plane,
} from 'lucide-react';
import { useAirportStore } from '../../store/useAirportStore';
import {
  useRadarSettingsStore,
  VectorLengthMinutes,
  MapMode,
  DeclutterLevel,
} from '../../store/useRadarSettingsStore';
import { useTrafficStore } from '../../store/useTrafficStore';
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
  const showRangeRings = useRadarSettingsStore((state) => state.showRangeRings);
  const setShowRangeRings = useRadarSettingsStore((state) => state.setShowRangeRings);
  const vectorLengthMin = useRadarSettingsStore((state) => state.vectorLengthMin);
  const setVectorLengthMin = useRadarSettingsStore((state) => state.setVectorLengthMin);
  const filterEnabled = useRadarSettingsStore((state) => state.filterEnabled);
  const setAltitudeFilter = useRadarSettingsStore((state) => state.setAltitudeFilter);
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

  // Sidebar toggle
  const sidebarOpen = useRadarSettingsStore((state) => state.sidebarOpen);
  const setSidebarOpen = useRadarSettingsStore((state) => state.setSidebarOpen);
  const activeCount = useTrafficStore((state) => state.activeCount);

  // VHF Sidebar, Flights Sidebar & GPS User Location
  const vhfSidebarOpen = useRadarSettingsStore((state) => state.vhfSidebarOpen);
  const setVhfSidebarOpen = useRadarSettingsStore((state) => state.setVhfSidebarOpen);
  const flightsSidebarOpen = useRadarSettingsStore((state) => state.flightsSidebarOpen);
  const setFlightsSidebarOpen = useRadarSettingsStore((state) => state.setFlightsSidebarOpen);
  const showUserLocation = useRadarSettingsStore((state) => state.showUserLocation);
  const setShowUserLocation = useRadarSettingsStore((state) => state.setShowUserLocation);

  // Available runway ends for the current airport
  const availableRunwayEnds = currentAirport.runways.flatMap((r) => [r.end1, r.end2]);

  return (
    <header className="h-12 bg-radar-panel border-b border-radar-border px-3 flex items-center justify-between relative z-[1000] select-none text-xs text-radar-green font-mono">
      {/* Section Gauche : Aérodrome, Pistes, METAR */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 font-bold text-radar-cyan border-r border-radar-border pr-2.5">
          <img
            src="/icon.png"
            alt="Local ATC Radar"
            className="w-5 h-5 object-contain shrink-0 drop-shadow-[0_0_6px_rgba(0,255,102,0.6)]"
          />
          <span className="tracking-wider font-extrabold text-radar-green">{t.appTitle}</span>
        </div>

        {/* Sélecteur d'aérodrome */}
        <div className="flex items-center gap-1 bg-radar-surface px-2 py-1 rounded border border-radar-border">
          <span className="text-radar-muted font-bold text-[10px]">{t.arp} :</span>
          <select
            value={currentAirport.icao}
            onChange={(e) => selectAirport(e.target.value)}
            className="bg-transparent font-bold text-radar-green focus:outline-none cursor-pointer"
          >
            {airports.map((apt) => (
              <option key={apt.icao} value={apt.icao} className="bg-radar-panel text-radar-green">
                {apt.icao} - {apt.city}
              </option>
            ))}
          </select>
        </div>

        {/* Sélecteur de piste en service */}
        <div className="flex items-center gap-1 bg-radar-surface px-2 py-1 rounded border border-radar-border">
          <span className="text-radar-muted font-bold text-[10px]">{t.rwy} :</span>
          <div className="flex gap-1">
            {availableRunwayEnds.map((rend) => {
              const isActive = rend.id === activeRunwayId;
              return (
                <button
                  key={rend.id}
                  onClick={() => setActiveRunway(rend.id)}
                  className={`px-1.5 py-0.5 rounded text-[11px] font-bold transition-colors ${
                    isActive
                      ? 'bg-radar-green text-radar-bg font-extrabold shadow-radar-green'
                      : 'text-radar-green hover:bg-radar-border'
                  }`}
                  title={`Cap ${rend.heading}°`}
                >
                  {rend.id} ({rend.heading}°)
                </button>
              );
            })}
          </div>
        </div>

        {/* Bouton Nouvel Aérodrome */}
        <button
          onClick={onOpenCustomAirport}
          className="p-1.5 rounded hover:bg-radar-surface text-radar-muted hover:text-radar-cyan transition-colors"
          title={t.addCustomAirport}
        >
          <PlusCircle className="w-4 h-4" />
        </button>

        {/* METAR Widget Météo Aérodrome */}
        <MetarWidget />
      </div>

      {/* Section Centre : Portée, Déclutter & Filtres */}
      <div className="flex items-center gap-2">
        {/* Source de données (uniquement FLUX DIRECT & ADSBx - mode sim supprimé) */}
        <div className="flex items-center bg-radar-surface rounded border border-radar-border p-0.5">
          <button
            onClick={() => setDataSource('live')}
            className={`px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition-colors ${
              dataSource === 'live'
                ? 'bg-radar-green text-radar-bg'
                : 'text-radar-muted hover:text-radar-green'
            }`}
          >
            <Radio className="w-3 h-3" />
            {t.liveFeed}
          </button>
          <button
            onClick={() => setDataSource('adsbx')}
            className={`px-2 py-1 rounded text-[11px] font-bold transition-colors ${
              dataSource === 'adsbx'
                ? 'bg-radar-cyan text-radar-bg'
                : 'text-radar-muted hover:text-radar-cyan'
            }`}
          >
            {t.adsbx}
          </button>
        </div>

        {/* Sélecteur de Portée Radar (jusqu'à 150 NM) */}
        <div className="flex items-center gap-1 bg-radar-surface px-1.5 py-1 rounded border border-radar-border">
          <Radar className="w-3.5 h-3.5 text-radar-cyan" />
          <span className="text-radar-muted text-[10px]">{t.range} :</span>
          <select
            value={detectionRangeNm}
            onChange={(e) => setDetectionRangeNm(Number(e.target.value))}
            className="bg-transparent font-bold text-radar-cyan text-xs focus:outline-none cursor-pointer"
          >
            <option value={30} className="bg-radar-panel text-radar-green">30 NM</option>
            <option value={50} className="bg-radar-panel text-radar-green">50 NM</option>
            <option value={75} className="bg-radar-panel text-radar-green">75 NM</option>
            <option value={100} className="bg-radar-panel text-radar-green">100 NM</option>
            <option value={150} className="bg-radar-panel text-radar-green">150 NM</option>
          </select>
        </div>

        {/* Bouton Déclutter (Normal / Épuré / Minimal) */}
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
          className="flex items-center gap-1 px-2 py-1 rounded bg-radar-surface border border-radar-border text-radar-cyan hover:border-radar-cyan transition-colors text-[11px] font-bold"
          title="Niveau de désencombrement des étiquettes et points"
        >
          <Sparkles className="w-3 h-3" />
          <span>
            {declutterLevel === 'clean'
              ? t.declutterMed
              : declutterLevel === 'minimal'
              ? t.declutterMin
              : t.declutterNorm}
          </span>
        </button>

        {/* Filtre Altitude Terminale (Double Slider) */}
        <AltitudeFilterWidget />

        {/* Durée du vecteur vitesse (1 / 2 / 3 min) */}
        <div className="flex items-center gap-1 bg-radar-surface px-1.5 py-1 rounded border border-radar-border">
          <Clock className="w-3 h-3 text-radar-muted" />
          <span className="text-radar-muted text-[10px]">{t.vector} :</span>
          {([1, 2, 3] as VectorLengthMinutes[]).map((m) => (
            <button
              key={m}
              onClick={() => setVectorLengthMin(m)}
              className={`px-1 rounded text-[10px] font-bold transition-colors ${
                vectorLengthMin === m
                  ? 'bg-radar-cyan text-radar-bg'
                  : 'text-radar-muted hover:text-radar-cyan'
              }`}
            >
              {m}m
            </button>
          ))}
        </div>
      </div>

      {/* Section Droite : Calques Aéronautiques, Fond de Carte, Langue & TRAFFIC */}
      <div className="flex items-center gap-2">
        {/* Toggles des Calques Aéronautiques */}
        <div className="flex items-center gap-0.5 bg-radar-surface p-0.5 rounded border border-radar-border">
          <button
            onClick={() => setShowAirspaces(!showAirspaces)}
            className={`px-1.5 py-1 rounded text-[10px] font-bold transition-colors ${
              showAirspaces
                ? 'bg-radar-cyan/20 text-radar-cyan border border-radar-cyan/40'
                : 'text-radar-muted hover:text-radar-cyan'
            }`}
            title={t.airspacesTooltip}
          >
            <Shield className="w-3 h-3 inline mr-0.5" />
            {t.ctr}
          </button>

          <button
            onClick={() => setShowNavaids(!showNavaids)}
            className={`px-1.5 py-1 rounded text-[10px] font-bold transition-colors ${
              showNavaids
                ? 'bg-radar-cyan/20 text-radar-cyan border border-radar-cyan/40'
                : 'text-radar-muted hover:text-radar-cyan'
            }`}
            title={t.navaidsTooltip}
          >
            <Navigation className="w-3 h-3 inline mr-0.5" />
            {t.vor}
          </button>

          <button
            onClick={() => setShowWaypoints(!showWaypoints)}
            className={`px-1.5 py-1 rounded text-[10px] font-bold transition-colors ${
              showWaypoints
                ? 'bg-radar-green/20 text-radar-green border border-radar-green/40'
                : 'text-radar-muted hover:text-radar-green'
            }`}
            title={t.waypointsTooltip}
          >
            <MapPin className="w-3 h-3 inline mr-0.5" />
            {t.fix}
          </button>

          <button
            onClick={() => setShowStars(!showStars)}
            className={`px-1.5 py-1 rounded text-[10px] font-bold transition-colors ${
              showStars
                ? 'bg-radar-green/20 text-radar-green border border-radar-green/40'
                : 'text-radar-muted hover:text-radar-green'
            }`}
            title={t.starsTooltip}
          >
            <Route className="w-3 h-3 inline mr-0.5" />
            {t.star}
          </button>
        </div>

        {/* Sélecteur de Fond de Carte (Pure, OSM, OpenAIP) */}
        <select
          value={mapMode}
          onChange={(e) => setMapMode(e.target.value as MapMode)}
          className="bg-radar-surface border border-radar-border rounded px-2 py-1 text-[11px] font-bold text-radar-green focus:outline-none cursor-pointer"
        >
          <option value="pure" className="bg-radar-panel text-radar-green">{t.mapModePure}</option>
          <option value="osm-dark" className="bg-radar-panel text-radar-green">{t.mapModeOsm}</option>
          <option value="openaip" className="bg-radar-panel text-radar-cyan">{t.mapModeOpenAip}</option>
        </select>

        {/* Sélecteur de Langue (Français / Anglais) */}
        <button
          onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
          className="px-1.5 py-1 rounded bg-radar-surface border border-radar-border text-[11px] font-bold text-radar-cyan hover:border-radar-cyan transition-colors flex items-center gap-1"
          title="Changer la langue / Switch language"
        >
          <Languages className="w-3.5 h-3.5" />
          <span>{language === 'fr' ? 'FR' : 'EN'}</span>
        </button>

        {/* Bouton Localisation GPS */}
        <button
          onClick={() => setShowUserLocation(!showUserLocation)}
          className={`p-1.5 rounded border transition-colors flex items-center gap-1 text-[11px] font-bold ${
            showUserLocation
              ? 'bg-radar-cyan text-radar-bg border-radar-cyan font-extrabold shadow-radar-cyan'
              : 'bg-radar-surface border-radar-border text-radar-muted hover:text-radar-cyan'
          }`}
          title={showUserLocation ? 'Masquer ma position GPS' : 'Afficher ma position GPS sur le radar'}
        >
          <Crosshair className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">GPS</span>
        </button>

        {/* Bouton Fréquences VHF ATC (Panneau latéral gauche) */}
        <button
          onClick={() => setVhfSidebarOpen(!vhfSidebarOpen)}
          className={`px-2 py-1 rounded border text-[11px] font-bold flex items-center gap-1.5 transition-colors ${
            vhfSidebarOpen
              ? 'bg-radar-cyan text-radar-bg border-radar-cyan font-extrabold shadow-radar-cyan'
              : 'bg-radar-surface border-radar-border text-radar-muted hover:text-radar-cyan'
          }`}
          title="Afficher/Masquer le panneau des Fréquences Radio VHF"
        >
          <Headphones className="w-3.5 h-3.5" />
          <span>VHF</span>
        </button>

        {/* Bouton Tableau des Vols (FIDS Arrivées & Départs) */}
        <button
          onClick={() => setFlightsSidebarOpen(!flightsSidebarOpen)}
          className={`px-2 py-1 rounded border text-[11px] font-bold flex items-center gap-1.5 transition-colors ${
            flightsSidebarOpen
              ? 'bg-radar-green text-radar-bg border-radar-green font-extrabold shadow-radar-green'
              : 'bg-radar-surface border-radar-border text-radar-muted hover:text-radar-green'
          }`}
          title="Afficher/Masquer le tableau des vols (Arrivées & Départs)"
        >
          <Plane className="w-3.5 h-3.5" />
          <span>VOLS</span>
        </button>

        {/* Bouton Recentrer */}
        <button
          onClick={triggerCenter}
          className="p-1.5 rounded bg-radar-surface border border-radar-border text-radar-muted hover:text-radar-green hover:border-radar-green transition-colors"
          title={t.recenter}
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        {/* Bouton Paramètres */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded bg-radar-surface border border-radar-border text-radar-muted hover:text-radar-cyan hover:border-radar-cyan transition-colors"
          title={t.settings}
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>

        {/* Bouton TRAFFIC (Renommé comme demandé) */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`px-2.5 py-1 rounded border text-[11px] font-bold flex items-center gap-1.5 transition-colors ${
            sidebarOpen
              ? 'bg-radar-cyan text-radar-bg border-radar-cyan font-extrabold shadow-radar-cyan'
              : 'bg-radar-surface border-radar-border text-radar-muted hover:text-radar-cyan'
          }`}
          title="Afficher/Masquer le menu Trafic"
        >
          <TableProperties className="w-3.5 h-3.5" />
          <span>TRAFFIC</span>
          <span className="bg-black/30 px-1 rounded text-[10px]">{activeCount}</span>
        </button>
      </div>
    </header>
  );
};
