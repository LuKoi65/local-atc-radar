import React, { useEffect } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import { useAirportStore } from '../../store/useAirportStore';
import { useRadarSettingsStore } from '../../store/useRadarSettingsStore';
import { useCursorStore } from '../../store/useCursorStore';
import { calculateBearing, haversineDistanceNm } from '../../utils/aviationMath';

export const MapEventsHandler: React.FC = () => {
  const map = useMap();
  const currentAirport = useAirportStore((state) => state.currentAirport);
  const getActiveRunwayEnd = useAirportStore((state) => state.getActiveRunwayEnd);
  const centerTrigger = useRadarSettingsStore((state) => state.centerTrigger);
  const setCursorPos = useCursorStore((state) => state.setCursorPos);
  const resetCursor = useCursorStore((state) => state.resetCursor);

  // Recenter map when airport changes or when centerTrigger increments
  useEffect(() => {
    if (currentAirport) {
      map.setView([currentAirport.lat, currentAirport.lon], 11, {
        animate: true,
      });
    }
  }, [currentAirport, centerTrigger, map]);

  useMapEvents({
    mousemove(e) {
      const { lat, lng: lon } = e.latlng;
      const rwyEnd = getActiveRunwayEnd();
      const origin = rwyEnd?.threshold || { lat: currentAirport.lat, lon: currentAirport.lon };

      const bearing = calculateBearing(origin.lat, origin.lon, lat, lon);
      const distance = haversineDistanceNm(origin.lat, origin.lon, lat, lon);

      setCursorPos(lat, lon, bearing, distance);
    },
    mouseout() {
      resetCursor();
    },
  });

  return null;
};
