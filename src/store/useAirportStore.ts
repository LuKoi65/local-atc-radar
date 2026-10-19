import { create } from 'zustand';
import { Airport, RunwayEnd } from '../data/airports/types';
import { AIRPORT_PRESETS } from '../data/airports/presets';

const STORAGE_CUSTOM_AIRPORTS = 'atc_custom_airports_v1';
const STORAGE_SELECTED_AIRPORT = 'atc_selected_airport_v1';
const STORAGE_SELECTED_RUNWAY = 'atc_selected_runway_v1';

function loadAirports(): Airport[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_CUSTOM_AIRPORTS) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge preset airports with any saved custom airports (avoid duplicates by ICAO)
        const presetIcaos = new Set(AIRPORT_PRESETS.map((a) => a.icao.toUpperCase()));
        const customOnly = parsed.filter((a: Airport) => a.icao && !presetIcaos.has(a.icao.toUpperCase()));
        return [...AIRPORT_PRESETS, ...customOnly];
      }
    }
  } catch (e) {
    console.warn('[AirportStore] Failed to load custom airports:', e);
  }
  return AIRPORT_PRESETS;
}

function loadInitialAirport(allAirports: Airport[]): { apt: Airport; rwyId: string } {
  try {
    const savedIcao = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_SELECTED_AIRPORT) : null;
    if (savedIcao) {
      const found = allAirports.find((a) => a.icao.toUpperCase() === savedIcao.toUpperCase());
      if (found) {
        const savedRwy = localStorage.getItem(STORAGE_SELECTED_RUNWAY);
        const rwyValid = found.runways.some((r) => r.end1.id === savedRwy || r.end2.id === savedRwy);
        return { apt: found, rwyId: rwyValid ? (savedRwy as string) : found.defaultActiveRunway };
      }
    }
  } catch (e) {
    console.warn('[AirportStore] Failed to load saved airport choice:', e);
  }
  return { apt: allAirports[0] || AIRPORT_PRESETS[0], rwyId: (allAirports[0] || AIRPORT_PRESETS[0]).defaultActiveRunway };
}

const initialAirports = loadAirports();
const { apt: initialAirport, rwyId: initialRunwayId } = loadInitialAirport(initialAirports);

interface AirportState {
  airports: Airport[];
  currentAirport: Airport;
  activeRunwayId: string;
  selectAirport: (icao: string) => void;
  setActiveRunway: (runwayId: string) => void;
  addAirport: (airport: Airport) => void;
  getActiveRunwayEnd: () => RunwayEnd | undefined;
}

export const useAirportStore = create<AirportState>((set, get) => ({
  airports: initialAirports,
  currentAirport: initialAirport,
  activeRunwayId: initialRunwayId,

  selectAirport: (icao: string) => {
    const apt = get().airports.find((a) => a.icao.toUpperCase() === icao.toUpperCase());
    if (apt) {
      try {
        localStorage.setItem(STORAGE_SELECTED_AIRPORT, apt.icao);
        localStorage.setItem(STORAGE_SELECTED_RUNWAY, apt.defaultActiveRunway);
      } catch (e) {}
      set({
        currentAirport: apt,
        activeRunwayId: apt.defaultActiveRunway,
      });
    }
  },

  setActiveRunway: (runwayId: string) => {
    try {
      localStorage.setItem(STORAGE_SELECTED_RUNWAY, runwayId);
    } catch (e) {}
    set({ activeRunwayId: runwayId });
  },

  addAirport: (airport: Airport) => {
    set((state) => {
      const updatedAirports = [...state.airports, airport];
      try {
        const presetIcaos = new Set(AIRPORT_PRESETS.map((a) => a.icao.toUpperCase()));
        const customOnly = updatedAirports.filter((a) => !presetIcaos.has(a.icao.toUpperCase()));
        localStorage.setItem(STORAGE_CUSTOM_AIRPORTS, JSON.stringify(customOnly));
        localStorage.setItem(STORAGE_SELECTED_AIRPORT, airport.icao);
        localStorage.setItem(STORAGE_SELECTED_RUNWAY, airport.defaultActiveRunway);
      } catch (e) {}
      return {
        airports: updatedAirports,
        currentAirport: airport,
        activeRunwayId: airport.defaultActiveRunway,
      };
    });
  },

  getActiveRunwayEnd: () => {
    const { currentAirport, activeRunwayId } = get();
    for (const rwy of currentAirport.runways) {
      if (rwy.end1.id === activeRunwayId) return rwy.end1;
      if (rwy.end2.id === activeRunwayId) return rwy.end2;
    }
    // Fallback to first runway end
    return currentAirport.runways[0]?.end1;
  },
}));
