import { create } from 'zustand';
import { haversineDistanceNm, calculateBearing } from '../utils/aviationMath';

export interface RulerPoint {
  lat: number;
  lon: number;
}

interface RulerState {
  isActive: boolean;
  isLocked: boolean;
  startPoint: RulerPoint | null;
  endPoint: RulerPoint | null;
  distanceNm: number | null;
  bearingDeg: number | null;

  startRuler: (pt: RulerPoint) => void;
  updateRuler: (pt: RulerPoint) => void;
  lockRuler: () => void;
  clearRuler: () => void;
}

export const useRulerStore = create<RulerState>((set, get) => ({
  isActive: false,
  isLocked: false,
  startPoint: null,
  endPoint: null,
  distanceNm: null,
  bearingDeg: null,

  startRuler: (pt) => {
    set({
      isActive: true,
      isLocked: false,
      startPoint: pt,
      endPoint: pt,
      distanceNm: 0,
      bearingDeg: 0,
    });
  },

  updateRuler: (pt) => {
    const { isActive, isLocked, startPoint } = get();
    if (!isActive || isLocked || !startPoint) return;

    const dist = haversineDistanceNm(startPoint.lat, startPoint.lon, pt.lat, pt.lon);
    const brg = calculateBearing(startPoint.lat, startPoint.lon, pt.lat, pt.lon);

    set({
      endPoint: pt,
      distanceNm: dist,
      bearingDeg: brg,
    });
  },

  lockRuler: () => {
    set({ isLocked: true });
  },

  clearRuler: () => {
    set({
      isActive: false,
      isLocked: false,
      startPoint: null,
      endPoint: null,
      distanceNm: null,
      bearingDeg: null,
    });
  },
}));
