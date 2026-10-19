import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Plane,
  PlaneTakeoff,
  PlaneLanding,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  X,
  ExternalLink,
  Radio,
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useAirportStore } from '../../store/useAirportStore';
import { useRadarSettingsStore } from '../../store/useRadarSettingsStore';
import { useTrafficStore } from '../../store/useTrafficStore';
import { flightScheduleService, AirportFlight, AirportFidsResponse } from '../../services/flights/flightScheduleService';

export const FlightsSidebar: React.FC = () => {
  const { currentAirport } = useAirportStore();
  const {
    flightsSidebarOpen,
    flightsSidebarWidth,
    flightsTab,
    setFlightsSidebarOpen,
    setFlightsSidebarWidth,
    setFlightsTab,
    vhfSidebarOpen,
    vhfSidebarWidth,
    setSidebarOpen,
    setSidebarTab,
  } = useRadarSettingsStore();

  const { aircraftList, selectAircraft } = useTrafficStore();

  const [data, setData] = useState<AirportFidsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'landed' | 'delayed'>('all');

  // Load flights data on mount and whenever currentAirport changes
  const loadFlights = async (force: boolean = false) => {
    if (!currentAirport?.icao) return;
    setLoading(true);
    try {
      const res = await flightScheduleService.fetchAirportFlights(currentAirport.icao);
      setData(res);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Error fetching airport flights:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFlights();
    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      loadFlights();
    }, 60000);
    return () => clearInterval(interval);
  }, [currentAirport.icao]);

  // Correlate flights with current radar traffic
  const correlatedDepartures = useMemo(() => {
    if (!data?.departures) return [];
    return flightScheduleService.correlateWithLiveTraffic(data.departures, aircraftList);
  }, [data?.departures, aircraftList]);

  const correlatedArrivals = useMemo(() => {
    if (!data?.arrivals) return [];
    return flightScheduleService.correlateWithLiveTraffic(data.arrivals, aircraftList);
  }, [data?.arrivals, aircraftList]);

  const activeFlightList = flightsTab === 'arrivals' ? correlatedArrivals : correlatedDepartures;

  // Filter flights by search term and status
  const filteredFlights = useMemo(() => {
    return activeFlightList.filter((f) => {
      const term = searchTerm.toLowerCase().trim();
      const matchSearch =
        !term ||
        f.flightNumber.toLowerCase().includes(term) ||
        f.callsign.toLowerCase().includes(term) ||
        f.city.toLowerCase().includes(term) ||
        f.airportCode.toLowerCase().includes(term) ||
        f.airline.toLowerCase().includes(term) ||
        f.aircraftType.toLowerCase().includes(term);

      if (!matchSearch) return false;

      if (statusFilter === 'all') return true;
      if (statusFilter === 'active') {
        return f.statusType === 'en_route' || f.statusType === 'boarding' || f.inRadar;
      }
      if (statusFilter === 'landed') {
        return f.statusType === 'landed' || f.statusType === 'departed';
      }
      if (statusFilter === 'delayed') {
        return f.statusType === 'delayed';
      }
      return true;
    });
  }, [activeFlightList, searchTerm, statusFilter]);

  // Draggable right edge resize handler
  const handleMouseDownResize = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = flightsSidebarWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      const newWidth = Math.max(320, Math.min(750, startWidth + delta));
      setFlightsSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Helper to focus matched aircraft in Radar
  const handleFocusOnRadar = (hex?: string) => {
    if (!hex) return;
    selectAircraft(hex);
    setSidebarOpen(true);
    setSidebarTab('inspector');
  };

  // When collapsed: show toggle pill on left side below VHF
  if (!flightsSidebarOpen) {
    const totalFlights = (correlatedArrivals.length || 0) + (correlatedDepartures.length || 0);
    return (
      <button
        onClick={() => setFlightsSidebarOpen(true)}
        style={{ left: vhfSidebarOpen ? `${vhfSidebarWidth}px` : '0px' }}
        className="absolute top-[230px] bg-radar-panel border-r border-y border-radar-border hover:border-radar-cyan px-2 py-4 rounded-r-md shadow-2xl z-[460] flex flex-col items-center gap-2 text-radar-cyan hover:text-white transition-all duration-150"
        title="Ouvrir le tableau des vols (Arrivées & Départs)"
      >
        <Plane className="w-4 h-4 text-radar-cyan animate-pulse" />
        <span className="[writing-mode:vertical-lr] text-[10px] font-bold tracking-widest uppercase">
          VOLS ({currentAirport.icao})
        </span>
        {totalFlights > 0 && (
          <span className="bg-radar-cyan/20 text-radar-cyan text-[9px] px-1 py-0.5 rounded font-mono font-bold border border-radar-cyan/40">
            {totalFlights}
          </span>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-radar-cyan" />
      </button>
    );
  }

  // Vertical position depends on whether VHF sidebar is also open
  const containerClasses = vhfSidebarOpen
    ? 'top-[50%] bottom-8 border-t border-radar-border'
    : 'top-12 bottom-8';

  return (
    <aside
      style={{ width: `${flightsSidebarWidth}px` }}
      className={`absolute left-0 ${containerClasses} bg-radar-panel/95 backdrop-blur-md border-r border-radar-border shadow-2xl z-[450] flex flex-col font-mono text-radar-green select-none`}
    >
      {/* Draggable Right Resize Handle */}
      <div
        onMouseDown={handleMouseDownResize}
        className="absolute -right-1.5 top-0 bottom-0 w-3 cursor-ew-resize hover:bg-radar-cyan/30 active:bg-radar-cyan/50 transition-colors z-[500] group flex items-center justify-center"
        title="Glisser pour redimensionner"
      >
        <div className="w-1 h-12 bg-radar-border group-hover:bg-radar-cyan group-active:bg-radar-cyan rounded-full transition-colors" />
      </div>

      {/* Header */}
      <div className="bg-radar-surface/90 border-b border-radar-border p-2.5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Plane className="w-4 h-4 text-radar-cyan" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-radar-cyan text-xs tracking-wider">
                  TABLEAU DES VOLS (FIDS)
                </span>
                <span className="bg-[#14222e] px-1.5 py-0.5 rounded text-[10px] border border-radar-cyan/40 text-radar-green font-bold">
                  {currentAirport.icao}
                </span>
              </div>
              <div className="text-[10px] text-radar-muted truncate max-w-[220px]">
                {currentAirport.name}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => loadFlights(true)}
              disabled={loading}
              className={`p-1 rounded text-radar-muted hover:text-radar-cyan hover:bg-radar-panel transition-colors ${
                loading ? 'animate-spin text-radar-cyan' : ''
              }`}
              title="Rafraîchir les horaires"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setFlightsSidebarOpen(false)}
              className="text-radar-muted hover:text-radar-cyan p-1 hover:bg-radar-panel rounded transition-colors"
              title="Masquer le tableau des vols"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Source & Live sync indicator */}
        <div className="flex items-center justify-between text-[9px] text-radar-muted mb-2 px-1">
          <span className="flex items-center gap-1">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                data?.source === 'tlp_aeroport_live' ? 'bg-radar-green animate-pulse' : 'bg-radar-cyan'
              }`}
            />
            {data?.source === 'tlp_aeroport_live'
              ? 'En direct du site de l\'aéroport TLP'
              : 'Programme officiel des vols'}
          </span>
          {lastRefreshed && (
            <span>
              MàJ {lastRefreshed.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>

        {/* Tabs: Arrivées vs Départs */}
        <div className="grid grid-cols-2 gap-1.5 bg-radar-panel p-1 rounded border border-radar-border text-xs">
          <button
            onClick={() => setFlightsTab('arrivals')}
            className={`py-1.5 px-2 rounded font-bold flex items-center justify-center gap-2 transition-all ${
              flightsTab === 'arrivals'
                ? 'bg-radar-cyan text-radar-bg shadow-[0_0_10px_rgba(0,229,255,0.4)]'
                : 'text-radar-muted hover:text-radar-cyan'
            }`}
          >
            <PlaneLanding className="w-3.5 h-3.5" />
            <span>ARRIVÉES</span>
            <span className="text-[10px] bg-radar-surface/80 px-1.5 py-0.2 rounded border border-current/20">
              {correlatedArrivals.length}
            </span>
          </button>

          <button
            onClick={() => setFlightsTab('departures')}
            className={`py-1.5 px-2 rounded font-bold flex items-center justify-center gap-2 transition-all ${
              flightsTab === 'departures'
                ? 'bg-radar-green text-radar-bg shadow-[0_0_10px_rgba(0,255,102,0.4)]'
                : 'text-radar-muted hover:text-radar-green'
            }`}
          >
            <PlaneTakeoff className="w-3.5 h-3.5" />
            <span>DÉPARTS</span>
            <span className="text-[10px] bg-radar-surface/80 px-1.5 py-0.2 rounded border border-current/20">
              {correlatedDepartures.length}
            </span>
          </button>
        </div>

        {/* Search bar & Filter Pills */}
        <div className="mt-2 flex flex-col gap-1.5">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-radar-muted pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher (vol, ville, compagnie)..."
              className="w-full h-8 bg-radar-panel border border-radar-border rounded pl-8 pr-7 text-xs text-radar-cyan placeholder-radar-muted focus:border-radar-cyan focus:outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-radar-muted hover:text-radar-alert p-1"
                title="Effacer la recherche"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 overflow-x-auto text-[10px]">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2 py-0.5 rounded border transition-colors ${
                statusFilter === 'all'
                  ? 'border-radar-cyan bg-radar-cyan/20 text-radar-cyan font-bold'
                  : 'border-radar-border text-radar-muted hover:text-white'
              }`}
            >
              Tous ({activeFlightList.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-2 py-0.5 rounded border transition-colors ${
                statusFilter === 'active'
                  ? 'border-radar-green bg-radar-green/20 text-radar-green font-bold'
                  : 'border-radar-border text-radar-muted hover:text-white'
              }`}
            >
              En vol / Approche
            </button>
            <button
              onClick={() => setStatusFilter('delayed')}
              className={`px-2 py-0.5 rounded border transition-colors ${
                statusFilter === 'delayed'
                  ? 'border-radar-amber bg-radar-amber/20 text-radar-amber font-bold'
                  : 'border-radar-border text-radar-muted hover:text-white'
              }`}
            >
              Retards
            </button>
            <button
              onClick={() => setStatusFilter('landed')}
              className={`px-2 py-0.5 rounded border transition-colors ${
                statusFilter === 'landed'
                  ? 'border-radar-muted bg-radar-panel text-white font-bold'
                  : 'border-radar-border text-radar-muted hover:text-white'
              }`}
            >
              Terminés
            </button>
          </div>
        </div>
      </div>

      {/* Flight Cards List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {filteredFlights.length === 0 ? (
          <div className="text-center py-8 text-radar-muted text-xs">
            Aucun vol correspondant trouvé pour {currentAirport.icao}.
          </div>
        ) : (
          filteredFlights.map((flight) => {
            const isArrival = flight.type === 'arrival';

            // Status Badge Colors & Style
            let badgeBg = 'bg-[#14222e] text-radar-cyan border-radar-cyan/40';
            let statusIcon = <Clock className="w-3 h-3 text-radar-cyan" />;

            if (flight.statusType === 'landed') {
              badgeBg = 'bg-[#102219] text-radar-green border-radar-green/40';
              statusIcon = <CheckCircle2 className="w-3 h-3 text-radar-green" />;
            } else if (flight.statusType === 'departed') {
              badgeBg = 'bg-[#102219] text-radar-green border-radar-green/40';
              statusIcon = <CheckCircle2 className="w-3 h-3 text-radar-green" />;
            } else if (flight.statusType === 'delayed') {
              badgeBg = 'bg-[#2a1e0f] text-radar-amber border-radar-amber/40';
              statusIcon = <AlertCircle className="w-3 h-3 text-radar-amber" />;
            } else if (flight.statusType === 'boarding' || flight.statusType === 'en_route') {
              badgeBg = 'bg-[#0f2233] text-radar-cyan border-radar-cyan/60 animate-pulse';
              statusIcon = <Plane className="w-3 h-3 text-radar-cyan" />;
            }

            return (
              <div
                key={flight.id}
                className={`bg-radar-surface/80 rounded border p-2.5 transition-all hover:bg-radar-surface hover:border-radar-cyan/60 ${
                  flight.inRadar
                    ? 'border-radar-green shadow-[0_0_8px_rgba(0,255,102,0.2)]'
                    : 'border-radar-border'
                }`}
              >
                {/* Header row: Flight # + Airline + Aircraft */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm tracking-wide">
                      {flight.flightNumber}
                    </span>
                    <span className="text-[11px] text-radar-muted">
                      ({flight.callsign})
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] bg-radar-panel px-1.5 py-0.5 rounded border border-radar-border text-radar-cyan font-bold">
                      {flight.aircraftType}
                    </span>
                  </div>
                </div>

                {/* Company Name */}
                <div className="text-xs font-semibold text-radar-green mb-2 truncate">
                  {flight.airline}
                </div>

                {/* Route: Origin / Destination */}
                <div className="flex items-center justify-between bg-radar-panel/70 p-2 rounded border border-radar-border/60 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-radar-surface flex items-center justify-center text-radar-cyan">
                      {isArrival ? (
                        <PlaneLanding className="w-3.5 h-3.5" />
                      ) : (
                        <PlaneTakeoff className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div>
                      <div className="text-[10px] text-radar-muted">
                        {isArrival ? 'En provenance de :' : 'À destination de :'}
                      </div>
                      <div className="text-xs font-bold text-white tracking-wide">
                        {flight.city} ({flight.airportCode})
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] text-radar-muted">Heure prévue</div>
                    <div className="text-sm font-bold text-radar-cyan">
                      {flight.scheduledTime}
                    </div>
                  </div>
                </div>

                {/* Status Badge & Actions */}
                <div className="flex items-center justify-between pt-1 border-t border-radar-border/40 text-xs">
                  <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold border ${badgeBg}`}>
                    {statusIcon}
                    <span>{flight.status}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* FlightAware Link */}
                    <a
                      href={`https://flightaware.com/live/flight/${encodeURIComponent(flight.callsign)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-radar-muted hover:text-radar-cyan flex items-center gap-1 transition-colors"
                      title="Suivre sur FlightAware"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>FA</span>
                    </a>

                    {/* FlightRadar24 Link */}
                    <a
                      href={`https://www.flightradar24.com/data/flights/${encodeURIComponent(flight.flightNumber.replace(/\s+/g, ''))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-radar-muted hover:text-radar-amber flex items-center gap-1 transition-colors"
                      title="Suivre sur FlightRadar24"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>FR24</span>
                    </a>
                  </div>
                </div>

                {/* Live ADS-B Detection Indicator */}
                {flight.inRadar && (
                  <div className="mt-2 bg-[#092b1a] border border-radar-green/60 rounded p-1.5 flex items-center justify-between text-[11px] text-radar-green">
                    <div className="flex items-center gap-1.5 font-bold animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-radar-green shadow-[0_0_8px_#00ff66]" />
                      <span>DÉTECTÉ AU RADAR</span>
                      <span className="text-[10px] text-white">
                        ({flight.radarDistanceNm?.toFixed(0)} NM • {flight.radarAltitudeFt} ft)
                      </span>
                    </div>

                    <button
                      onClick={() => handleFocusOnRadar(flight.radarHex)}
                      className="bg-radar-green text-radar-bg px-2 py-0.5 rounded font-bold text-[10px] hover:bg-radar-cyan transition-colors"
                      title="Verrouiller et inspecter sur le scope radar"
                    >
                      Voir sur Scope
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-radar-surface/90 border-t border-radar-border px-3 py-2 text-[10px] text-radar-muted flex items-center justify-between">
        <span>Total : {filteredFlights.length} vol(s)</span>
        <span className="text-radar-cyan">
          {currentAirport.city} ({currentAirport.icao})
        </span>
      </div>
    </aside>
  );
};
