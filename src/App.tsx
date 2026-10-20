import React, { useState, useEffect, useRef } from 'react';
import { TopBar } from './components/hud/TopBar';
import { BottomBar } from './components/hud/BottomBar';
import { TrafficSidebar } from './components/hud/TrafficSidebar';
import { CustomAirportModal } from './components/hud/CustomAirportModal';
import { SettingsModal } from './components/hud/SettingsModal';
import { VhfSidebar } from './components/hud/VhfSidebar';
import { FlightsSidebar } from './components/hud/FlightsSidebar';
import { RadarScope } from './components/radar/RadarScope';
import { useAirportStore } from './store/useAirportStore';
import { useRadarSettingsStore, applyThemeColorsToCss } from './store/useRadarSettingsStore';
import { useTrafficStore } from './store/useTrafficStore';
import { useAlertLogStore } from './store/useAlertLogStore';
import { adsbService } from './services/adsb/adsbService';
import { metarService } from './services/weather/metarService';

export const App: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCustomAirportOpen, setIsCustomAirportOpen] = useState(false);

  const currentAirport = useAirportStore((state) => state.currentAirport);
  const activeRunwayId = useAirportStore((state) => state.activeRunwayId);
  const getActiveRunwayEnd = useAirportStore((state) => state.getActiveRunwayEnd);

  const dataSource = useRadarSettingsStore((state) => state.dataSource);
  const rapidApiKey = useRadarSettingsStore((state) => state.rapidApiKey);
  const detectionRangeNm = useRadarSettingsStore((state) => state.detectionRangeNm);
  const setMetar = useRadarSettingsStore((state) => state.setMetar);
  const guiTheme = useRadarSettingsStore((state) => state.guiTheme);
  const customColors = useRadarSettingsStore((state) => state.customColors);

  const setTraffic = useTrafficStore((state) => state.setTraffic);
  const setPolling = useTrafficStore((state) => state.setPolling);
  const setError = useTrafficStore((state) => state.setError);

  const activeRunwayEnd = getActiveRunwayEnd();
  const pollingRef = useRef<boolean>(false);

  // Clear cache on airport change
  useEffect(() => {
    adsbService.clearCache();
  }, [currentAirport.icao, activeRunwayId]);

  // Fetch METAR weather whenever airport changes and every 60 seconds
  useEffect(() => {
    let isCancelled = false;

    const loadMetar = async () => {
      try {
        const weather = await metarService.fetchMetar(currentAirport.icao);
        if (!isCancelled) {
          setMetar(weather);
        }
      } catch (e) {
        console.warn('METAR fetch error:', e);
      }
    };

    loadMetar();
    const metarInterval = setInterval(loadMetar, 60000);

    return () => {
      isCancelled = true;
      clearInterval(metarInterval);
    };
  }, [currentAirport.icao, setMetar]);

  // Main 2-second ADS-B live polling loop
  useEffect(() => {
    let isCancelled = false;

    const fetchCycle = async () => {
      if (pollingRef.current) return;
      pollingRef.current = true;
      setPolling(true);

      try {
        const traffic = await adsbService.fetchTraffic(
          dataSource,
          currentAirport,
          activeRunwayEnd,
          rapidApiKey,
          detectionRangeNm // Support range up to 150 NM
        );

        if (!isCancelled) {
          setTraffic(traffic);

          // Automatically record transponder emergency squawks (7700, 7600, 7500)
          for (const ac of traffic) {
            const sq = ac.squawk?.trim();
            if (sq === '7700' || sq === '7600' || sq === '7500') {
              useAlertLogStore.getState().addEntry({
                type: sq === '7700' ? 'SQUAWK_EMERGENCY' : sq === '7600' ? 'SQUAWK_RADIO' : 'SQUAWK_HIJACK',
                severity: 'warning',
                title: `URGENCE TRANSPONDEUR ${sq} : ${ac.flight}`,
                details: `${ac.flight} (${ac.registration || ac.hex}) à ${ac.altitudeFt} FT - ${ac.groundSpeedKts} kts (${ac.operator || 'Opérateur inconnu'}).`,
                callsign1: ac.flight,
                hex1: ac.hex,
              });
            }
          }
        }
      } catch (err: any) {
        if (!isCancelled) {
          setError(err.message || 'Erreur lors de la récupération du trafic');
        }
      } finally {
        pollingRef.current = false;
        if (!isCancelled) {
          setPolling(false);
        }
      }
    };

    // Immediate first fetch
    fetchCycle();

    // 2-second interval for live updates
    const interval = setInterval(fetchCycle, 2000);

    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [dataSource, currentAirport.icao, activeRunwayId, rapidApiKey, detectionRangeNm]);

  // Synchronize active theme & custom accent colors with document.body & CSS variables
  useEffect(() => {
    if (guiTheme === 'classic') {
      document.body.classList.add('theme-classic');
      document.body.classList.remove('theme-modern');
    } else {
      document.body.classList.add('theme-modern');
      document.body.classList.remove('theme-classic');
    }

    const activeColors = guiTheme === 'classic' ? customColors?.classic : customColors?.modern;
    if (activeColors) {
      applyThemeColorsToCss(activeColors);
    }
  }, [guiTheme, customColors]);

  return (
    <div
      className={`flex flex-col h-screen w-screen overflow-hidden bg-radar-bg text-radar-green font-mono select-none ${
        guiTheme === 'classic' ? 'theme-classic' : 'theme-modern'
      }`}
    >
      {/* Top HUD Controls Bar */}
      <TopBar
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenCustomAirport={() => setIsCustomAirportOpen(true)}
      />

      {/* Center Radar Scope Display Area */}
      <main className="relative flex-1 w-full h-full overflow-hidden flex">
        {/* VHF Frequencies Sidebar (Left) */}
        <VhfSidebar />

        {/* Airport Flights (FIDS Arrivals & Departures) Sidebar (Left below VHF) */}
        <FlightsSidebar />

        {/* Central Radar Scope Canvas */}
        <RadarScope />

        {/* TRAFFIC Sidebar (Right - List & Inspector) */}
        <TrafficSidebar />
      </main>

      {/* Bottom Status Bar with Zulu Clock & BRA Measurement */}
      <BottomBar />

      {/* Dialog Modals */}
      <CustomAirportModal
        isOpen={isCustomAirportOpen}
        onClose={() => setIsCustomAirportOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

export default App;
