import { create } from 'zustand';

interface CursorState {
  lat: number | null;
  lon: number | null;
  braBearing: number | null;
  braDistanceNm: number | null;
  setCursorPos: (lat: number, lon: number, bearing: number, dist: number) => void;
  resetCursor: () => void;
}

export const useCursorStore = create<CursorState>((set) => ({
  lat: null,
  lon: null,
  braBearing: null,
  braDistanceNm: null,

  setCursorPos: (lat, lon, bearing, dist) =>
    set({
      lat,
      lon,
      braBearing: bearing,
      braDistanceNm: dist,
    }),

  resetCursor: () =>
    set({
      lat: null,
      lon: null,
      braBearing: null,
      braDistanceNm: null,
    }),
}));
