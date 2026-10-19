import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Language } from '../utils/i18n';
import { MetarData } from '../services/weather/metarService';

export type MapMode = 'pure' | 'osm-dark' | 'openaip';
export type DataSource = 'live' | 'adsbx';
export type VectorLengthMinutes = 1 | 2 | 3;
export type SidebarTab = 'list' | 'inspector';
export type DeclutterLevel = 'normal' | 'clean' | 'minimal';
export type GuiTheme = 'modern' | 'classic'; // 'modern' is default glowing phosphor, 'classic' is crude squared vintage ATC console

export interface TagOffset {
  x: number;
  y: number;
}

interface RadarSettingsState {
  language: Language;
  mapMode: MapMode;
  showRangeRings: boolean;
  rangeRingDistances: number[];
  detectionRangeNm: number;
  vectorLengthMin: VectorLengthMinutes;
  altitudeFilterMin: number;
  altitudeFilterMax: number;
  filterEnabled: boolean;
  dataSource: DataSource;
  rapidApiKey: string;
  openAipApiKey: string;
  showExtendedCenterlines: boolean;
  showIlsFeather: boolean;
  centerTrigger: number;
  declutterLevel: DeclutterLevel;

  // Aeronautical Map Information layers
  showAirspaces: boolean;
  showNavaids: boolean;
  showWaypoints: boolean;
  showStars: boolean;

  // ADSBexchange-style Sidebar
  sidebarOpen: boolean;
  sidebarTab: SidebarTab;
  sidebarWidth: number;

  // GPS User Location
  showUserLocation: boolean;
  userLocation: { lat: number; lon: number; accuracyMeters?: number } | null;

  // VHF Frequency Left Sidebar
  vhfSidebarOpen: boolean;
  vhfSidebarWidth: number;
  isFrequencyModalOpen: boolean;

  // Airport FIDS / Flights Timetable Left Sidebar
  flightsSidebarOpen: boolean;
  flightsSidebarWidth: number;
  flightsTab: 'arrivals' | 'departures';

  // Movable / Draggable Tag Offsets by Hex
  tagOffsets: Record<string, TagOffset>;

  // Weather METAR
  currentMetar: MetarData | null;
  guiTheme: GuiTheme;

  setGuiTheme: (theme: GuiTheme) => void;
  setLanguage: (lang: Language) => void;
  setMapMode: (mode: MapMode) => void;
  setShowRangeRings: (show: boolean) => void;
  toggleRangeRingDistance: (dist: number) => void;
  setDetectionRangeNm: (range: number) => void;
  setVectorLengthMin: (min: VectorLengthMinutes) => void;
  setAltitudeFilter: (min: number, max: number, enabled: boolean) => void;
  setDataSource: (source: DataSource) => void;
  setRapidApiKey: (key: string) => void;
  setOpenAipApiKey: (key: string) => void;
  setShowExtendedCenterlines: (show: boolean) => void;
  setShowIlsFeather: (show: boolean) => void;
  triggerCenter: () => void;
  setDeclutterLevel: (level: DeclutterLevel) => void;

  setShowAirspaces: (show: boolean) => void;
  setShowNavaids: (show: boolean) => void;
  setShowWaypoints: (show: boolean) => void;
  setShowStars: (show: boolean) => void;

  setSidebarOpen: (open: boolean) => void;
  setSidebarTab: (tab: SidebarTab) => void;
  setSidebarWidth: (width: number) => void;
  setVhfSidebarOpen: (open: boolean) => void;
  setVhfSidebarWidth: (width: number) => void;
  setFlightsSidebarOpen: (open: boolean) => void;
  setFlightsSidebarWidth: (width: number) => void;
  setFlightsTab: (tab: 'arrivals' | 'departures') => void;
  setShowUserLocation: (show: boolean) => void;
  setUserLocation: (loc: { lat: number; lon: number; accuracyMeters?: number } | null) => void;
  setIsFrequencyModalOpen: (open: boolean) => void;
  setTagOffset: (hex: string, offset: TagOffset) => void;
  resetTagOffset: (hex: string) => void;
  resetAllTagOffsets: () => void;
  setMetar: (metar: MetarData | null) => void;
}

export const useRadarSettingsStore = create<RadarSettingsState>()(
  persist(
    (set) => ({
      language: 'fr', // Français par défaut
      mapMode: 'pure',
  showRangeRings: true,
  rangeRingDistances: [5, 10, 15, 20, 30, 50],
  detectionRangeNm: 50,
  vectorLengthMin: 1,
  altitudeFilterMin: 0,
  altitudeFilterMax: 15000,
  filterEnabled: false,
  dataSource: 'live',
  rapidApiKey: '',
  openAipApiKey: 'e40a5fded6fa41e9f5eb159d2092d6bc', // Clé OpenAIP fournie par l'utilisateur
  showExtendedCenterlines: true,
  showIlsFeather: true,
  centerTrigger: 0,
  declutterLevel: 'clean', // Mode Épuré par défaut pour éviter le fouillis

  showAirspaces: true,
  showNavaids: true,
  showWaypoints: true,
  showStars: true,

  sidebarOpen: false, // Discret à l'ouverture, s'ouvre d'un clic ou lors de la sélection
  sidebarTab: 'list',
  sidebarWidth: 420, // Largeur par défaut agréable et redimensionnable
  vhfSidebarOpen: false,
  vhfSidebarWidth: 380, // Largeur par défaut du panneau VHF gauche
  flightsSidebarOpen: false,
  flightsSidebarWidth: 420, // Largeur par défaut du panneau des vols gauche
  flightsTab: 'arrivals',
  showUserLocation: false,
  userLocation: null,
  isFrequencyModalOpen: false,
  tagOffsets: {},
  currentMetar: null,
  guiTheme: (typeof window !== 'undefined' && (localStorage.getItem('atc_gui_theme') as GuiTheme)) || 'modern',

  setGuiTheme: (theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('atc_gui_theme', theme);
    }
    set({ guiTheme: theme });
  },
  setLanguage: (lang) => set({ language: lang }),
  setMapMode: (mode) => set({ mapMode: mode }),
  setShowRangeRings: (show) => set({ showRangeRings: show }),
  toggleRangeRingDistance: (dist) =>
    set((state) => {
      const exists = state.rangeRingDistances.includes(dist);
      const next = exists
        ? state.rangeRingDistances.filter((d) => d !== dist)
        : [...state.rangeRingDistances, dist].sort((a, b) => a - b);
      return { rangeRingDistances: next };
    }),
  setDetectionRangeNm: (range) =>
    set((state) => {
      // Ajuster intelligemment les anneaux de distance en fonction de la portée
      let rings = [5, 10, 15, 20, 30];
      if (range >= 75) rings = [10, 20, 30, 50, 75];
      if (range >= 100) rings = [10, 25, 50, 75, 100];
      if (range >= 150) rings = [20, 50, 75, 100, 150];
      return { detectionRangeNm: range, rangeRingDistances: rings };
    }),
  setVectorLengthMin: (min) => set({ vectorLengthMin: min }),
  setAltitudeFilter: (min, max, enabled) =>
    set({ altitudeFilterMin: min, altitudeFilterMax: max, filterEnabled: enabled }),
  setDataSource: (source) => set({ dataSource: source }),
  setRapidApiKey: (key) => set({ rapidApiKey: key }),
  setOpenAipApiKey: (key) => set({ openAipApiKey: key }),
  setShowExtendedCenterlines: (show) => set({ showExtendedCenterlines: show }),
  setShowIlsFeather: (show) => set({ showIlsFeather: show }),
  triggerCenter: () => set((state) => ({ centerTrigger: state.centerTrigger + 1 })),
  setDeclutterLevel: (level) => set({ declutterLevel: level }),

  setShowAirspaces: (show) => set({ showAirspaces: show }),
  setShowNavaids: (show) => set({ showNavaids: show }),
  setShowWaypoints: (show) => set({ showWaypoints: show }),
  setShowStars: (show) => set({ showStars: show }),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSidebarTab: (tab) => set({ sidebarTab: tab }),
  setSidebarWidth: (width) => set({ sidebarWidth: Math.max(320, Math.min(800, width)) }),
  setVhfSidebarOpen: (open) => set({ vhfSidebarOpen: open }),
  setVhfSidebarWidth: (width) => set({ vhfSidebarWidth: Math.max(300, Math.min(650, width)) }),
  setFlightsSidebarOpen: (open) => set({ flightsSidebarOpen: open }),
  setFlightsSidebarWidth: (width) => set({ flightsSidebarWidth: Math.max(320, Math.min(750, width)) }),
  setFlightsTab: (tab) => set({ flightsTab: tab }),
  setShowUserLocation: (show) => set({ showUserLocation: show }),
  setUserLocation: (loc) => set({ userLocation: loc }),
  setIsFrequencyModalOpen: (open) => set({ isFrequencyModalOpen: open, vhfSidebarOpen: open }),
  setTagOffset: (hex, offset) =>
    set((state) => ({
      tagOffsets: {
        ...state.tagOffsets,
        [hex]: offset,
      },
    })),
  resetTagOffset: (hex) =>
    set((state) => {
      const copy = { ...state.tagOffsets };
      delete copy[hex];
      return { tagOffsets: copy };
    }),
  resetAllTagOffsets: () => set({ tagOffsets: {} }),
  setMetar: (metar) => set({ currentMetar: metar }),
}),
{
  name: 'atc_radar_settings_v1',
  partialize: (state) => ({
    guiTheme: state.guiTheme,
    language: state.language,
    mapMode: state.mapMode,
    showRangeRings: state.showRangeRings,
    rangeRingDistances: state.rangeRingDistances,
    detectionRangeNm: state.detectionRangeNm,
    vectorLengthMin: state.vectorLengthMin,
    altitudeFilterMin: state.altitudeFilterMin,
    altitudeFilterMax: state.altitudeFilterMax,
    filterEnabled: state.filterEnabled,
    dataSource: state.dataSource,
    rapidApiKey: state.rapidApiKey,
    openAipApiKey: state.openAipApiKey,
    showExtendedCenterlines: state.showExtendedCenterlines,
    showIlsFeather: state.showIlsFeather,
    declutterLevel: state.declutterLevel,
    showAirspaces: state.showAirspaces,
    showNavaids: state.showNavaids,
    showWaypoints: state.showWaypoints,
    showStars: state.showStars,
    showUserLocation: state.showUserLocation,
    sidebarWidth: state.sidebarWidth,
    vhfSidebarWidth: state.vhfSidebarWidth,
    flightsSidebarWidth: state.flightsSidebarWidth,
    flightsTab: state.flightsTab,
    tagOffsets: state.tagOffsets,
  }),
}
));
