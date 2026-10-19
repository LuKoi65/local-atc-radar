import { create } from 'zustand';
import { Aircraft } from '../services/adsb/types';

interface TrafficState {
  aircraftList: Aircraft[];
  selectedHex: string | null;
  lastUpdated: number;
  activeCount: number;
  isPolling: boolean;
  errorMessage: string | null;

  setTraffic: (list: Aircraft[]) => void;
  selectAircraft: (hex: string | null) => void;
  setPolling: (polling: boolean) => void;
  setError: (msg: string | null) => void;
  getSelectedAircraft: () => Aircraft | undefined;
}

export const useTrafficStore = create<TrafficState>((set, get) => ({
  aircraftList: [],
  selectedHex: null,
  lastUpdated: Date.now(),
  activeCount: 0,
  isPolling: false,
  errorMessage: null,

  setTraffic: (list: Aircraft[]) => {
    set({
      aircraftList: list,
      activeCount: list.length,
      lastUpdated: Date.now(),
      errorMessage: null,
    });
  },

  selectAircraft: (hex: string | null) => {
    set({ selectedHex: hex });
  },

  setPolling: (polling: boolean) => {
    set({ isPolling: polling });
  },

  setError: (msg: string | null) => {
    set({ errorMessage: msg });
  },

  getSelectedAircraft: () => {
    const { aircraftList, selectedHex } = get();
    if (!selectedHex) return undefined;
    return aircraftList.find((ac) => ac.hex === selectedHex);
  },
}));
