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
export type TrailLengthMode = 'off' | '1min' | '3min' | 'all';
export type TagDisplayMode = 'compact' | 'standard' | 'extended';

export interface ThemeAccentColors {
  primary: string;   // Green / Main accent
  secondary: string; // Cyan / Secondary accent
  amber: string;     // Amber / Caution
  muted: string;     // Text Muted (High readability labels & secondary details)
}

export const DEFAULT_COLORS_MODERN: ThemeAccentColors = {
  primary: '#00ff66',
  secondary: '#00e5ff',
  amber: '#ffaa00',
  muted: '#94a8a4', // High readability (no more dark grey on grey)
};

export const DEFAULT_COLORS_CLASSIC: ThemeAccentColors = {
  primary: '#00cc55',
  secondary: '#00bcd4',
  amber: '#cc8400',
  muted: '#8eaba5',
};

export function hexToRgb(hex: string): string {
  const clean = hex.replace('#', '').trim();
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const num = parseInt(full, 16);
  if (isNaN(num)) return '0 255 102';
  return `${(num >> 16) & 255} ${(num >> 8) & 255} ${num & 255}`;
}

export function applyThemeColorsToCss(colors: ThemeAccentColors) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty('--radar-green', colors.primary);
  root.style.setProperty('--radar-green-rgb', hexToRgb(colors.primary));
  root.style.setProperty('--radar-cyan', colors.secondary);
  root.style.setProperty('--radar-cyan-rgb', hexToRgb(colors.secondary));
  root.style.setProperty('--radar-amber', colors.amber);
  root.style.setProperty('--radar-amber-rgb', hexToRgb(colors.amber));
  root.style.setProperty('--radar-muted', colors.muted);
  root.style.setProperty('--radar-muted-rgb', hexToRgb(colors.muted));
}

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

  // Custom accent colors per theme
  customColors: {
    modern: ThemeAccentColors;
    classic: ThemeAccentColors;
  };

  setThemeAccentColor: (theme: GuiTheme, key: keyof ThemeAccentColors, color: string) => void;
  resetThemeAccentColors: (theme: GuiTheme) => void;
  setThemePreset: (theme: GuiTheme, colors: ThemeAccentColors) => void;

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
  // Flight route dashed display on map
  showFlightRouteOnMap: boolean;
  setShowFlightRouteOnMap: (show: boolean) => void;
  toggleFlightRouteOnMap: () => void;
  fitRouteTrigger: number;
  triggerFitRoute: () => void;

  // STCA / Collision Proximity Alert settings
  stcaEnabled: boolean;
  setStcaEnabled: (enabled: boolean) => void;
  stcaAudioEnabled: boolean;
  setStcaAudioEnabled: (enabled: boolean) => void;
  mutedConflictIds: string[];
  muteConflict: (conflictId: string) => void;
  unmuteConflict: (conflictId: string) => void;
  clearMutedConflicts: () => void;

  // Breadcrumbs & Radar History Trails
  trailLengthMode: TrailLengthMode;
  setTrailLengthMode: (mode: TrailLengthMode) => void;

  // Radar Data Tags Customization
  tagDisplayMode: TagDisplayMode;
  setTagDisplayMode: (mode: TagDisplayMode) => void;
  autoDeconflictTags: boolean;
  setAutoDeconflictTags: (auto: boolean) => void;

  // Alert Log Modal
  alertLogModalOpen: boolean;
  setAlertLogModalOpen: (open: boolean) => void;

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
  showFlightRouteOnMap: false,
  fitRouteTrigger: 0,
  setShowFlightRouteOnMap: (show) => set({ showFlightRouteOnMap: show }),
  toggleFlightRouteOnMap: () => set((state) => ({ showFlightRouteOnMap: !state.showFlightRouteOnMap })),
  triggerFitRoute: () => set((state) => ({ fitRouteTrigger: state.fitRouteTrigger + 1 })),

  stcaEnabled: true,
  setStcaEnabled: (enabled) => set({ stcaEnabled: enabled }),
  stcaAudioEnabled: true,
  setStcaAudioEnabled: (enabled) => set({ stcaAudioEnabled: enabled }),
  mutedConflictIds: [],
  muteConflict: (conflictId) =>
    set((state) => ({
      mutedConflictIds: state.mutedConflictIds.includes(conflictId)
        ? state.mutedConflictIds
        : [...state.mutedConflictIds, conflictId],
    })),
  unmuteConflict: (conflictId) =>
    set((state) => ({
      mutedConflictIds: state.mutedConflictIds.filter((id) => id !== conflictId),
    })),
  clearMutedConflicts: () => set({ mutedConflictIds: [] }),

  trailLengthMode: '3min',
  setTrailLengthMode: (mode) => set({ trailLengthMode: mode }),

  tagDisplayMode: 'standard',
  setTagDisplayMode: (mode) => set({ tagDisplayMode: mode }),
  autoDeconflictTags: true,
  setAutoDeconflictTags: (auto) => set({ autoDeconflictTags: auto }),

  alertLogModalOpen: false,
  setAlertLogModalOpen: (open) => set({ alertLogModalOpen: open }),
  guiTheme: (typeof window !== 'undefined' && (localStorage.getItem('atc_gui_theme') as GuiTheme)) || 'modern',

  customColors: {
    modern: { ...DEFAULT_COLORS_MODERN },
    classic: { ...DEFAULT_COLORS_CLASSIC },
  },

  setThemeAccentColor: (theme, key, color) => {
    set((state) => {
      const nextThemeColors = {
        ...state.customColors[theme],
        [key]: color,
      };
      const nextCustomColors = {
        ...state.customColors,
        [theme]: nextThemeColors,
      };
      if (state.guiTheme === theme) {
        applyThemeColorsToCss(nextThemeColors);
      }
      return { customColors: nextCustomColors };
    });
  },

  resetThemeAccentColors: (theme) => {
    set((state) => {
      const defaultColors = theme === 'classic' ? { ...DEFAULT_COLORS_CLASSIC } : { ...DEFAULT_COLORS_MODERN };
      const nextCustomColors = {
        ...state.customColors,
        [theme]: defaultColors,
      };
      if (state.guiTheme === theme) {
        applyThemeColorsToCss(defaultColors);
      }
      return { customColors: nextCustomColors };
    });
  },

  setThemePreset: (theme, colors) => {
    set((state) => {
      const nextCustomColors = {
        ...state.customColors,
        [theme]: { ...colors },
      };
      if (state.guiTheme === theme) {
        applyThemeColorsToCss(colors);
      }
      return { customColors: nextCustomColors };
    });
  },

  setGuiTheme: (theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('atc_gui_theme', theme);
    }
    set((state) => {
      const colors = state.customColors[theme] || (theme === 'classic' ? DEFAULT_COLORS_CLASSIC : DEFAULT_COLORS_MODERN);
      applyThemeColorsToCss(colors);
      return { guiTheme: theme };
    });
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
    customColors: state.customColors,
    showFlightRouteOnMap: state.showFlightRouteOnMap,
    stcaEnabled: state.stcaEnabled,
    stcaAudioEnabled: state.stcaAudioEnabled,
    trailLengthMode: state.trailLengthMode,
    tagDisplayMode: state.tagDisplayMode,
    autoDeconflictTags: state.autoDeconflictTags,
  }),
}
));
