import { create } from 'zustand';

export type AlertEventType =
  | 'STCA_WARNING'
  | 'STCA_CAUTION'
  | 'SQUAWK_EMERGENCY'
  | 'SQUAWK_RADIO'
  | 'SQUAWK_HIJACK';

export interface AlertLogEntry {
  id: string;
  timestamp: number;
  type: AlertEventType;
  title: string;
  details: string;
  callsign1: string;
  hex1: string;
  callsign2?: string;
  hex2?: string;
  severity: 'warning' | 'caution' | 'info';
}

interface AlertLogState {
  entries: AlertLogEntry[];
  unreadCount: number;
  addEntry: (entry: Omit<AlertLogEntry, 'id' | 'timestamp'>) => void;
  clearLog: () => void;
  markAllRead: () => void;
}

// In-memory set to prevent duplicate log entries within a short timeframe
const recentEventDeduplication = new Map<string, number>();

export const useAlertLogStore = create<AlertLogState>((set) => ({
  entries: [],
  unreadCount: 0,

  addEntry: (data) => {
    const key = `${data.type}_${data.hex1}_${data.hex2 || ''}`;
    const now = Date.now();
    const lastLogged = recentEventDeduplication.get(key) || 0;

    // Deduplicate identical events within 60 seconds
    if (now - lastLogged < 60000) {
      return;
    }
    recentEventDeduplication.set(key, now);

    const newEntry: AlertLogEntry = {
      ...data,
      id: `${now}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: now,
    };

    set((state) => ({
      entries: [newEntry, ...state.entries].slice(0, 100), // Keep latest 100 events
      unreadCount: state.unreadCount + 1,
    }));
  },

  clearLog: () => {
    recentEventDeduplication.clear();
    set({ entries: [], unreadCount: 0 });
  },

  markAllRead: () => {
    set({ unreadCount: 0 });
  },
}));
