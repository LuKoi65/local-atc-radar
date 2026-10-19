import React, { useState, useEffect, useMemo } from 'react';
import {
  Plane,
  Search,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  X,
  Gauge,
  Navigation,
  Compass,
  Radio,
  Clock,
  AlertTriangle,
  Camera,
  Globe,
  ArrowUpDown,
} from 'lucide-react';
import { useTrafficStore } from '../../store/useTrafficStore';
import { useAirportStore } from '../../store/useAirportStore';
import { useRadarSettingsStore } from '../../store/useRadarSettingsStore';
import {
  formatAltitude,
  formatVerticalTrend,
  inspectSquawk,
} from '../../utils/aviationMath';
import { Aircraft } from '../../services/adsb/types';
import { TRANSLATIONS } from '../../utils/i18n';
import { routeService, FlightRoute } from '../../services/adsb/routeService';
import { CountryFlag } from '../common/CountryFlag';

export const TrafficSidebar: React.FC = () => {
  const language = useRadarSettingsStore((state) => state.language);
  const t = TRANSLATIONS[language];

  const filterEnabled = useRadarSettingsStore((state) => state.filterEnabled);
  const altitudeFilterMin = useRadarSettingsStore((state) => state.altitudeFilterMin);
  const altitudeFilterMax = useRadarSettingsStore((state) => state.altitudeFilterMax);

  const aircraftList = useTrafficStore((state) => state.aircraftList);
  const selectedHex = useTrafficStore((state) => state.selectedHex);
  const selectAircraft = useTrafficStore((state) => state.selectAircraft);
  const getSelectedAircraft = useTrafficStore((state) => state.getSelectedAircraft);

  const sidebarOpen = useRadarSettingsStore((state) => state.sidebarOpen);
  const setSidebarOpen = useRadarSettingsStore((state) => state.setSidebarOpen);
  const sidebarTab = useRadarSettingsStore((state) => state.sidebarTab);
  const setSidebarTab = useRadarSettingsStore((state) => state.setSidebarTab);
  const sidebarWidth = useRadarSettingsStore((state) => state.sidebarWidth);
  const setSidebarWidth = useRadarSettingsStore((state) => state.setSidebarWidth);

  const currentAirport = useAirportStore((state) => state.currentAirport);
  const activeRunwayId = useAirportStore((state) => state.activeRunwayId);
  const getActiveRunwayEnd = useAirportStore((state) => state.getActiveRunwayEnd);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'distance' | 'altitude' | 'speed' | 'callsign'>('distance');
  const [sortAsc, setSortAsc] = useState(true);

  // Subscribe to live route updates from FlightAware
  const [, setRouteTick] = useState(0);
  useEffect(() => {
    return routeService.subscribe(() => setRouteTick((t) => t + 1));
  }, []);

  // Resize handler for left edge dragging
  const handleMouseDownResize = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = startX - moveEvent.clientX; // moving left expands sidebar
      const newWidth = Math.max(340, Math.min(850, startWidth + delta));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const selectedAircraft = getSelectedAircraft();
  const activeRunwayEnd = getActiveRunwayEnd();

  // Automatically open sidebar and switch to Inspector tab when an aircraft is selected
  React.useEffect(() => {
    if (selectedHex) {
      setSidebarOpen(true);
      setSidebarTab('inspector');
    }
  }, [selectedHex, setSidebarOpen, setSidebarTab]);

  // Filtered and sorted aircraft list
  const filteredList = useMemo(() => {
    let list = aircraftList.filter((ac) => {
      // Altitude filter
      if (filterEnabled) {
        if (ac.altitudeFt < altitudeFilterMin || ac.altitudeFt > altitudeFilterMax) {
          return false;
        }
      }

      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        ac.flight.toLowerCase().includes(term) ||
        ac.registration.toLowerCase().includes(term) ||
        ac.type.toLowerCase().includes(term) ||
        ac.hex.toLowerCase().includes(term) ||
        ac.country.toLowerCase().includes(term) ||
        ac.operator.toLowerCase().includes(term)
      );
    });

    list.sort((a, b) => {
      let diff = 0;
      if (sortBy === 'distance') {
        diff = (a.distanceToArpNm || 0) - (b.distanceToArpNm || 0);
      } else if (sortBy === 'altitude') {
        diff = a.altitudeFt - b.altitudeFt;
      } else if (sortBy === 'speed') {
        diff = a.groundSpeedKts - b.groundSpeedKts;
      } else if (sortBy === 'callsign') {
        diff = a.flight.localeCompare(b.flight);
      }
      return sortAsc ? diff : -diff;
    });

    return list;
  }, [aircraftList, searchTerm, sortBy, sortAsc, filterEnabled, altitudeFilterMin, altitudeFilterMax]);

  // Request routes from FlightAware for top visible aircraft and selected aircraft
  useEffect(() => {
    if (filteredList.length > 0) {
      const topFlights = filteredList.slice(0, 20).map((a) => a.flight);
      routeService.requestBatch(topFlights);
    }
  }, [filteredList]);

  useEffect(() => {
    if (selectedAircraft?.flight) {
      routeService.fetchRoute(selectedAircraft.flight);
    }
  }, [selectedAircraft?.flight]);

  // When clicking an aircraft in the list, select it and show Inspector
  const handleSelectAircraft = (ac: Aircraft) => {
    selectAircraft(ac.hex);
    setSidebarTab('inspector');
  };

  const rwyHeading = activeRunwayEnd?.heading || 0;
  const trackDiff = selectedAircraft
    ? ((selectedAircraft.trackDeg - rwyHeading + 540) % 360) - 180
    : 0;

  let etaSeconds: number | null = null;
  if (selectedAircraft && selectedAircraft.distanceToThresholdNm && selectedAircraft.groundSpeedKts > 30) {
    etaSeconds = Math.round((selectedAircraft.distanceToThresholdNm / selectedAircraft.groundSpeedKts) * 3600);
  }

  const formatEta = (sec: number | null) => {
    if (sec === null) return '--:--';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // If sidebar is collapsed, show discreet toggle tab
  if (!sidebarOpen) {
    return (
      <button
        onClick={() => setSidebarOpen(true)}
        className="absolute right-0 top-14 bg-radar-panel border-l border-y border-radar-border hover:border-radar-cyan px-2 py-4 rounded-l-md shadow-2xl z-[450] flex flex-col items-center gap-2 text-radar-green hover:text-radar-cyan transition-colors"
        title="Ouvrir le menu Trafic"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="[writing-mode:vertical-lr] text-[10px] font-bold tracking-widest uppercase">
          TRAFFIC ({aircraftList.length})
        </span>
      </button>
    );
  }

  return (
    <aside
      style={{ width: `${sidebarWidth}px` }}
      className="absolute right-0 top-12 bottom-8 bg-radar-panel/95 backdrop-blur-md border-l border-radar-border shadow-2xl z-[450] flex flex-col font-mono text-radar-green select-none"
    >
      {/* Draggable Left Resize Handle */}
      <div
        onMouseDown={handleMouseDownResize}
        className="absolute -left-1.5 top-0 bottom-0 w-3 cursor-ew-resize hover:bg-radar-cyan/30 active:bg-radar-cyan/50 transition-colors z-[500] group flex items-center justify-center"
        title="Glisser vers la gauche ou la droite pour redimensionner"
      >
        <div className="w-1 h-12 bg-radar-border group-hover:bg-radar-cyan group-active:bg-radar-cyan rounded-full transition-colors" />
      </div>

      {/* Sidebar Header & Tabs */}
      <div className="bg-radar-surface/90 border-b border-radar-border p-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 font-bold text-radar-cyan text-xs">
            <Globe className="w-4 h-4" />
            <span className="tracking-wider">TRAFFIC</span>
            <span className="bg-radar-surface px-1.5 py-0.5 rounded text-[10px] border border-radar-cyan/40">
              {aircraftList.length}
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-radar-muted hover:text-radar-cyan transition-colors p-1"
            title="Masquer le panneau"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Controls: List vs Inspector */}
        <div className="grid grid-cols-2 gap-1 bg-radar-panel p-0.5 rounded border border-radar-border text-xs">
          <button
            onClick={() => setSidebarTab('list')}
            className={`py-1 rounded font-bold transition-colors ${
              sidebarTab === 'list'
                ? 'bg-radar-green text-radar-bg shadow-radar-green'
                : 'text-radar-muted hover:text-radar-green'
            }`}
          >
            {t.trafficListTab} ({filteredList.length})
          </button>
          <button
            onClick={() => setSidebarTab('inspector')}
            className={`py-1 rounded font-bold transition-colors ${
              sidebarTab === 'inspector'
                ? 'bg-radar-cyan text-radar-bg shadow-radar-cyan'
                : 'text-radar-muted hover:text-radar-cyan'
            }`}
          >
            {t.inspectorTab} {selectedAircraft ? `(${selectedAircraft.flight})` : ''}
          </button>
        </div>
      </div>

      {/* TAB 1: AIRCRAFT LIST */}
      {sidebarTab === 'list' && (
        <div className="flex-1 flex flex-col overflow-hidden text-xs">
          {/* Search & Sort Bar */}
          <div className="p-2 border-b border-radar-border bg-radar-surface/50 flex gap-2">
            <div className="relative flex-1 flex items-center">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-radar-muted pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full h-8 bg-radar-panel border border-radar-border rounded pl-8 pr-7 text-xs text-radar-green placeholder-radar-muted focus:border-radar-cyan focus:outline-none"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-radar-muted hover:text-radar-alert p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={() => {
                const nextSort =
                  sortBy === 'distance'
                    ? 'altitude'
                    : sortBy === 'altitude'
                    ? 'speed'
                    : sortBy === 'speed'
                    ? 'callsign'
                    : 'distance';
                setSortBy(nextSort);
              }}
              className="px-2 py-1 bg-radar-panel border border-radar-border rounded text-[10px] text-radar-muted hover:text-radar-cyan flex items-center gap-1"
              title="Changer le critère de tri"
            >
              <ArrowUpDown className="w-3 h-3" />
              <span className="uppercase">{sortBy.substring(0, 4)}</span>
            </button>
          </div>

          {/* Traffic Table */}
          <div className="flex-1 overflow-y-auto">
            {filteredList.length === 0 ? (
              <div className="p-6 text-center text-radar-muted text-xs">
                {t.noTrafficMatching}
              </div>
            ) : (
              <div className="divide-y divide-radar-border/40">
                {filteredList.map((ac) => {
                  const isSelected = ac.hex === selectedHex;
                  const squawkInfo = inspectSquawk(ac.squawk);
                  const trend = formatVerticalTrend(ac.baroRateFpm);
                  const route = routeService.getCachedRoute(ac.flight);

                  return (
                    <div
                      key={ac.hex}
                      onClick={() => handleSelectAircraft(ac)}
                      className={`p-2 cursor-pointer transition-colors hover:bg-radar-surface/80 flex items-center justify-between ${
                        isSelected
                          ? 'bg-radar-cyan/15 border-l-2 border-radar-cyan'
                          : squawkInfo.isEmergency
                          ? 'bg-radar-alert/15 border-l-2 border-radar-alert'
                          : ''
                      }`}
                    >
                      {/* Left: Flag, Callsign, Type, Reg */}
                      <div className="flex items-center gap-2">
                        <CountryFlag
                          code={ac.countryCode}
                          country={ac.country}
                          flag={ac.flag}
                          className="w-5 h-3.5"
                        />
                        <div>
                          <div className="font-bold flex items-center gap-1.5">
                            <span
                              className={
                                isSelected
                                  ? 'text-radar-cyan font-extrabold'
                                  : squawkInfo.isEmergency
                                  ? 'text-radar-alert animate-pulse'
                                  : 'text-radar-green'
                              }
                            >
                              {ac.flight}
                            </span>
                            <span className="text-[10px] bg-radar-surface px-1 rounded text-radar-cyan border border-radar-border">
                              {ac.type}
                            </span>
                          </div>
                          <div className="text-[10px] text-radar-muted flex gap-2">
                            <span>{ac.registration}</span>
                            <span>{ac.operator}</span>
                          </div>
                          {route && (route.originCity || route.originIata || route.destCity || route.destIata) && (
                            <div className="text-[10px] font-bold flex items-center gap-1.5 text-radar-cyan mt-0.5 truncate max-w-[280px]">
                              <span className="text-white truncate max-w-[95px]" title={route.originCity || route.originIata}>
                                {route.originCity || route.originIata || '---'}
                              </span>
                              <span className="text-radar-muted font-mono tracking-tighter shrink-0 select-none">
                                ────────✈────────&gt;
                              </span>
                              <span className="text-radar-green truncate max-w-[95px]" title={route.destCity || route.destIata}>
                                {route.destCity || route.destIata || '---'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Altitude, Speed, Distance */}
                      <div className="text-right">
                        <div className="font-bold flex items-center justify-end gap-1">
                          <span>{formatAltitude(ac.altitudeFt, currentAirport.transitionAltitudeFt)}</span>
                          <span
                            className={
                              trend.symbol === '↑'
                                ? 'text-radar-cyan'
                                : trend.symbol === '↓'
                                ? 'text-radar-amber'
                                : 'text-radar-muted'
                            }
                          >
                            {trend.symbol}
                          </span>
                        </div>
                        <div className="text-[10px] text-radar-muted flex justify-end gap-2">
                          <span>{ac.groundSpeedKts} kt</span>
                          <span className="text-radar-green font-bold">
                            {ac.distanceToArpNm ? `${ac.distanceToArpNm.toFixed(1)} NM` : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: DETAILED TOWER INSPECTOR */}
      {sidebarTab === 'inspector' && (
        <div className="flex-1 flex flex-col overflow-y-auto p-3 space-y-3 text-xs">
          {!selectedAircraft ? (
            <div className="p-8 text-center text-radar-muted">
              <Plane className="w-8 h-8 mx-auto mb-2 opacity-40 text-radar-cyan" />
              <p>{t.noSelectedAircraft}</p>
              <p className="text-[10px] mt-1">{t.noSelectedAircraftHint}</p>
            </div>
          ) : (
            <>
              {/* Emergency Banner */}
              {inspectSquawk(selectedAircraft.squawk).isEmergency && (
                <div className="bg-radar-alert/20 border border-radar-alert p-2 rounded flex items-center gap-2 text-radar-alert font-bold text-xs animate-atc-blink">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>
                    {t.emergencyAlert} : SQUAWK {selectedAircraft.squawk} (
                    {inspectSquawk(selectedAircraft.squawk).alertType})
                  </span>
                </div>
              )}

              {/* Identity Card */}
              <div className="bg-radar-surface p-3 rounded border border-radar-border space-y-1.5">
                <div className="flex items-baseline justify-between">
                  <div className="flex items-center gap-2">
                    <CountryFlag
                      code={selectedAircraft.countryCode}
                      country={selectedAircraft.country}
                      flag={selectedAircraft.flag}
                      className="w-6 h-4"
                    />
                    <span className="text-xl font-black text-radar-green tracking-wide">
                      {selectedAircraft.flight}
                    </span>
                  </div>
                  <span className="text-radar-cyan font-bold text-xs bg-radar-panel px-2 py-0.5 rounded border border-radar-cyan/40">
                    {selectedAircraft.type}
                  </span>
                </div>

                <div className="text-[11px] text-radar-muted font-bold">
                  {selectedAircraft.desc}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-radar-border/40">
                  <div>
                    <span className="text-radar-muted">{t.reg} : </span>
                    <strong className="text-radar-green">{selectedAircraft.registration}</strong>
                  </div>
                  <div>
                    <span className="text-radar-muted">{t.icaoHex} : </span>
                    <strong className="text-radar-cyan">{selectedAircraft.hex}</strong>
                  </div>
                  <div>
                    <span className="text-radar-muted">{t.operator} : </span>
                    <strong className="text-radar-green">{selectedAircraft.operator}</strong>
                  </div>
                  <div>
                    <span className="text-radar-muted">{t.country} : </span>
                    <strong className="text-radar-cyan">{selectedAircraft.country}</strong>
                  </div>
                </div>
              </div>

              {/* FlightAware Direct Live Route Card */}
              {(() => {
                const route = routeService.getCachedRoute(selectedAircraft.flight);
                if (!route) return null;
                const hasOrig = Boolean(route.originCity || route.originIata);
                const hasDest = Boolean(route.destCity || route.destIata);
                if (!hasOrig && !hasDest) return null;

                return (
                  <div className="bg-radar-surface p-3 rounded border border-radar-border space-y-2">
                    <div className="text-[10px] font-bold text-radar-cyan uppercase tracking-wider flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Navigation className="w-3.5 h-3.5 text-radar-cyan" />
                        <span>ITINÉRAIRE EN DIRECT (FLIGHTAWARE)</span>
                      </div>
                      {route.originIata && route.destIata && (
                        <span className="text-[10px] text-radar-muted font-mono bg-radar-panel px-1.5 py-0.5 rounded border border-radar-border">
                          {route.originIata} → {route.destIata}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between bg-radar-panel p-2.5 rounded border border-radar-border/60">
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] text-radar-muted uppercase">DÉPART</div>
                        <div className="font-bold text-white text-xs truncate">
                          {route.originCity || route.originIata || 'Origine inconnue'}
                        </div>
                        {route.originIata && (
                          <div className="text-[10px] text-radar-cyan font-mono">
                            {route.originIata} {route.originIcao ? `(${route.originIcao})` : ''}
                          </div>
                        )}
                      </div>

                      <div className="px-3 flex flex-col items-center shrink-0">
                        <Plane className="w-4 h-4 text-radar-green rotate-90" />
                        <span className="text-[9px] text-radar-muted font-mono tracking-tighter">────────►</span>
                      </div>

                      <div className="flex-1 min-w-0 text-right">
                        <div className="text-[10px] text-radar-muted uppercase">ARRIVÉE</div>
                        <div className="font-bold text-radar-green text-xs truncate">
                          {route.destCity || route.destIata || 'Destination inconnue'}
                        </div>
                        {route.destIata && (
                          <div className="text-[10px] text-radar-cyan font-mono">
                            {route.destIata} {route.destIcao ? `(${route.destIcao})` : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* External Flight Tracker & Destination Links */}
              <div className="bg-radar-surface p-2.5 rounded border border-radar-border space-y-2">
                <div className="text-[10px] font-bold text-radar-cyan uppercase tracking-wider flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  <span>{t.trackersTitle}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* ADSBexchange Direct Globe Link */}
                  <a
                    href={`https://globe.adsbexchange.com/?icao=${selectedAircraft.hex}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded bg-radar-panel border border-radar-border hover:border-radar-green hover:text-radar-green transition-colors flex items-center justify-between text-[11px] min-w-0"
                    title="Ouvrir sur le globe 3D ADSBexchange"
                  >
                    <span className="truncate mr-1">{t.linkAdsbx}</span>
                    <ExternalLink className="w-3 h-3 text-radar-muted shrink-0" />
                  </a>

                  {/* FlightAware Route & Destination Link */}
                  <a
                    href={`https://flightaware.com/live/flight/${selectedAircraft.flight}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded bg-radar-panel border border-radar-border hover:border-radar-cyan hover:text-radar-cyan transition-colors flex items-center justify-between text-[11px] min-w-0"
                    title="Voir l'origine, la destination, les heures et retards sur FlightAware"
                  >
                    <span className="truncate mr-1">{t.linkFlightaware}</span>
                    <ExternalLink className="w-3 h-3 text-radar-muted shrink-0" />
                  </a>

                  {/* Flightradar24 Link */}
                  <a
                    href={`https://www.flightradar24.com/${selectedAircraft.flight}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded bg-radar-panel border border-radar-border hover:border-radar-amber hover:text-radar-amber transition-colors flex items-center justify-between text-[11px] min-w-0"
                    title="Suivre sur Flightradar24"
                  >
                    <span className="truncate mr-1">{t.linkFr24}</span>
                    <ExternalLink className="w-3 h-3 text-radar-muted shrink-0" />
                  </a>

                  {/* Planespotters Photo Search */}
                  <a
                    href={`https://www.planespotters.net/search?q=${selectedAircraft.registration || selectedAircraft.hex}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded bg-radar-panel border border-radar-border hover:border-radar-green hover:text-radar-green transition-colors flex items-center justify-between text-[11px] min-w-0"
                    title="Voir les photos de cet appareil sur Planespotters.net"
                  >
                    <span className="flex items-center gap-1 truncate mr-1">
                      <Camera className="w-3 h-3 shrink-0" />
                      <span className="truncate">{t.linkPhotos}</span>
                    </span>
                    <ExternalLink className="w-3 h-3 text-radar-muted shrink-0" />
                  </a>
                </div>
              </div>

              {/* Flight Dynamics Grid */}
              <div className="grid grid-cols-2 gap-2">
                {/* Altitude */}
                <div className="bg-radar-surface p-2 rounded border border-radar-border">
                  <div className="flex items-center gap-1 text-radar-muted text-[10px]">
                    <Gauge className="w-3 h-3 text-radar-cyan" />
                    <span>{t.altBaro}</span>
                  </div>
                  <div className="text-sm font-bold text-radar-green mt-0.5">
                    {formatAltitude(selectedAircraft.altitudeFt, currentAirport.transitionAltitudeFt)}
                  </div>
                  <div className="text-[10px] text-radar-muted flex justify-between mt-0.5">
                    <span>{selectedAircraft.altitudeFt.toLocaleString()} FT</span>
                    <span>{t.altGeom}: {selectedAircraft.altitudeGeomFt ? `${selectedAircraft.altitudeGeomFt} FT` : 'N/A'}</span>
                  </div>
                </div>

                {/* Vertical Speed */}
                <div className="bg-radar-surface p-2 rounded border border-radar-border">
                  <div className="flex items-center gap-1 text-radar-muted text-[10px]">
                    <Navigation className="w-3 h-3 text-radar-amber" />
                    <span>{t.vRate}</span>
                  </div>
                  <div className="text-sm font-bold text-radar-green mt-0.5 flex items-center gap-1">
                    <span>{formatVerticalTrend(selectedAircraft.baroRateFpm).symbol}</span>
                    <span>{Math.abs(selectedAircraft.baroRateFpm)}</span>
                    <span className="text-[10px] text-radar-muted">FPM</span>
                  </div>
                  <div className="text-[10px] text-radar-muted mt-0.5">
                    STATUT: <strong className="text-radar-cyan">
                      {formatVerticalTrend(selectedAircraft.baroRateFpm).label === 'CLB'
                        ? t.statusClimb
                        : formatVerticalTrend(selectedAircraft.baroRateFpm).label === 'DES'
                        ? t.statusDescent
                        : t.statusLevel}
                    </strong>
                  </div>
                </div>

                {/* Ground Speed & Airspeeds */}
                <div className="bg-radar-surface p-2 rounded border border-radar-border">
                  <div className="flex items-center gap-1 text-radar-muted text-[10px]">
                    <Clock className="w-3 h-3 text-radar-cyan" />
                    <span>{t.groundSpeed}</span>
                  </div>
                  <div className="text-sm font-bold text-radar-green mt-0.5">
                    {selectedAircraft.groundSpeedKts} <span className="text-[10px] text-radar-muted font-normal">KT SOL</span>
                  </div>
                  <div className="text-[10px] text-radar-muted mt-0.5 flex justify-between">
                    <span>{t.ias}: {selectedAircraft.iasKts ? `${selectedAircraft.iasKts} KT` : 'N/A'}</span>
                    <span>{t.mach}: {selectedAircraft.mach ? `M${selectedAircraft.mach}` : 'N/A'}</span>
                  </div>
                </div>

                {/* Track / Heading */}
                <div className="bg-radar-surface p-2 rounded border border-radar-border">
                  <div className="flex items-center gap-1 text-radar-muted text-[10px]">
                    <Compass className="w-3 h-3 text-radar-green" />
                    <span>{t.trackHdg}</span>
                  </div>
                  <div className="text-sm font-bold text-radar-green mt-0.5">
                    {selectedAircraft.trackDeg.toString().padStart(3, '0')}°
                  </div>
                  <div className="text-[10px] text-radar-muted mt-0.5 flex justify-between">
                    <span>{t.trueHdg}: {selectedAircraft.trueHeading ? `${selectedAircraft.trueHeading}°` : `${selectedAircraft.trackDeg}°`}</span>
                    <span>{t.rollAngle}: {selectedAircraft.rollDeg ? `${selectedAircraft.rollDeg}°` : '0°'}</span>
                  </div>
                </div>
              </div>

              {/* Transponder & Navigation Modes */}
              <div className="bg-radar-surface p-2.5 rounded border border-radar-border space-y-1.5 text-[11px]">
                <div className="flex justify-between items-center">
                  <span className="text-radar-muted">{t.squawk} :</span>
                  <span className="font-bold text-radar-cyan bg-radar-panel px-2 py-0.5 rounded border border-radar-border">
                    {selectedAircraft.squawk}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-radar-muted">{t.mcpAlt} :</span>
                  <span className="text-radar-green font-bold">
                    {selectedAircraft.navAltitudeMcp ? `${selectedAircraft.navAltitudeMcp} FT` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-radar-muted">{t.apModes} :</span>
                  <span className="text-radar-cyan text-[10px]">
                    {selectedAircraft.navModes ? selectedAircraft.navModes.join(', ').toUpperCase() : 'STANDARD'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-radar-muted">{t.signal} :</span>
                  <span className="text-radar-muted text-[10px]">
                    RSSI {selectedAircraft.rssi ? `${selectedAircraft.rssi} dB` : '-12 dB'} • {selectedAircraft.messages || 500} msgs
                  </span>
                </div>
              </div>

              {/* Runway Approach & Localizer Alignment */}
              <div className="bg-radar-surface p-2.5 rounded border border-radar-border space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between border-b border-radar-border/40 pb-1">
                  <span className="font-bold text-radar-cyan">
                    {t.approachGeometry} {activeRunwayId}
                  </span>
                  <span className="text-[10px] text-radar-muted">CAP {rwyHeading}°</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-radar-muted">{t.distThreshold} :</span>
                  <strong className="text-radar-green">
                    {selectedAircraft.distanceToThresholdNm?.toFixed(2)} NM
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-radar-muted">{t.brgThreshold} :</span>
                  <strong className="text-radar-green">
                    {selectedAircraft.bearingFromThresholdDeg?.toFixed(0).padStart(3, '0')}°
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-radar-muted">{t.locAlignment} :</span>
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
                      ? t.onLocalizer
                      : `${Math.abs(Math.round(trackDiff))}° ${trackDiff > 0 ? 'DROITE' : 'GAUCHE'}`}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-radar-muted">{t.etaTouchdown} :</span>
                  <strong className="text-radar-cyan font-bold">{formatEta(etaSeconds)}</strong>
                </div>
              </div>

              {/* Deselect Action Button */}
              <button
                onClick={() => selectAircraft(null)}
                className="w-full py-1.5 rounded bg-radar-surface border border-radar-border hover:bg-radar-panel text-radar-muted hover:text-radar-green transition-colors text-xs font-bold"
              >
                {t.deselectBtn}
              </button>
            </>
          )}
        </div>
      )}
    </aside>
  );
};
