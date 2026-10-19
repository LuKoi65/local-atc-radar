import { create } from 'zustand';
import { AtcFrequency, SOUTH_WEST_FREQUENCIES } from '../data/frequencies/southWestFrequencies';

const STORAGE_KEY = 'atc_vhf_frequencies_custom_v1';

function loadInitialFrequencies(): AtcFrequency[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('[FrequencyStore] Failed to load custom frequencies from localStorage:', e);
  }
  return SOUTH_WEST_FREQUENCIES;
}

function saveFrequencies(list: AtcFrequency[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('[FrequencyStore] Failed to save frequencies to localStorage:', e);
  }
}

interface FrequencyState {
  frequencies: AtcFrequency[];

  addFrequency: (freq: Omit<AtcFrequency, 'id'>) => void;
  updateFrequency: (id: string, updated: Partial<AtcFrequency>) => void;
  deleteFrequency: (id: string) => void;
  resetToDefaults: () => void;
  importFrequencies: (list: AtcFrequency[]) => void;
}

export const useFrequencyStore = create<FrequencyState>((set) => ({
  frequencies: loadInitialFrequencies(),

  addFrequency: (data) =>
    set((state) => {
      const newFreq: AtcFrequency = {
        ...data,
        id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      };
      const updated = [newFreq, ...state.frequencies];
      saveFrequencies(updated);
      return { frequencies: updated };
    }),

  updateFrequency: (id, partial) =>
    set((state) => {
      const updated = state.frequencies.map((f) => (f.id === id ? { ...f, ...partial } : f));
      saveFrequencies(updated);
      return { frequencies: updated };
    }),

  deleteFrequency: (id) =>
    set((state) => {
      const updated = state.frequencies.filter((f) => f.id !== id);
      saveFrequencies(updated);
      return { frequencies: updated };
    }),

  resetToDefaults: () =>
    set(() => {
      saveFrequencies(SOUTH_WEST_FREQUENCIES);
      return { frequencies: SOUTH_WEST_FREQUENCIES };
    }),

  importFrequencies: (list) =>
    set(() => {
      saveFrequencies(list);
      return { frequencies: list };
    }),
}));
