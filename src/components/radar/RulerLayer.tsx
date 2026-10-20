import React, { useEffect } from 'react';
import { useMap, useMapEvents, Polyline, Marker } from 'react-leaflet';
import L from 'leaflet';
import { useRulerStore } from '../../store/useRulerStore';
import { useRadarSettingsStore } from '../../store/useRadarSettingsStore';

export const RulerLayer: React.FC = () => {
  const map = useMap();
  const isActive = useRulerStore((state) => state.isActive);
  const isLocked = useRulerStore((state) => state.isLocked);
  const startPoint = useRulerStore((state) => state.startPoint);
  const endPoint = useRulerStore((state) => state.endPoint);
  const distanceNm = useRulerStore((state) => state.distanceNm);
  const bearingDeg = useRulerStore((state) => state.bearingDeg);

  const startRuler = useRulerStore((state) => state.startRuler);
  const updateRuler = useRulerStore((state) => state.updateRuler);
  const lockRuler = useRulerStore((state) => state.lockRuler);
  const clearRuler = useRulerStore((state) => state.clearRuler);

  const guiTheme = useRadarSettingsStore((state) => state.guiTheme);
  const customColors = useRadarSettingsStore((state) => state.customColors);

  const activeColors = guiTheme === 'classic' ? customColors?.classic : customColors?.modern;
  const secondaryColor = activeColors?.secondary || '#00e5ff';
  const primaryColor = activeColors?.primary || '#00ff66';

  // Prevent default contextmenu on map canvas
  useEffect(() => {
    const container = map.getContainer();
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    container.addEventListener('contextmenu', handleContextMenu);
    return () => {
      container.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [map]);

  // Press Escape to cancel ruler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isActive) {
        clearRuler();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, clearRuler]);

  // Leaflet map mouse events for right-click measurement
  useMapEvents({
    contextmenu(e) {
      L.DomEvent.preventDefault(e.originalEvent);
      L.DomEvent.stopPropagation(e.originalEvent);

      const pt = { lat: e.latlng.lat, lon: e.latlng.lng };

      if (!isActive) {
        startRuler(pt);
      } else if (isActive && !isLocked) {
        lockRuler();
      } else {
        // If already locked, start a fresh ruler from this new point
        startRuler(pt);
      }
    },
    mousemove(e) {
      if (isActive && !isLocked) {
        updateRuler({ lat: e.latlng.lat, lon: e.latlng.lng });
      }
    },
    click() {
      // If active and unlocked, left-click can also lock the measurement
      if (isActive && !isLocked) {
        lockRuler();
      }
    },
  });

  if (!isActive || !startPoint || !endPoint) {
    return null;
  }

  const isClassic = guiTheme === 'classic';

  // Start crosshair icon
  const startIcon = L.divIcon({
    className: 'ruler-start-icon',
    html: `
      <div style="position: relative; width: 0; height: 0;">
        <div style="position: absolute; left: -7px; top: -7px; width: 14px; height: 14px;
                    border: 1.5px solid ${secondaryColor}; border-radius: 50%;
                    box-shadow: 0 0 8px ${secondaryColor}; pointer-events: none;"></div>
        <div style="position: absolute; left: -2px; top: -2px; width: 4px; height: 4px;
                    background: ${secondaryColor}; border-radius: 50%;"></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });

  // End crosshair icon
  const endIcon = L.divIcon({
    className: 'ruler-end-icon',
    html: `
      <div style="position: relative; width: 0; height: 0;">
        <div style="position: absolute; left: -6px; top: -6px; width: 12px; height: 12px;
                    border: 1.5px solid ${primaryColor}; border-radius: ${isClassic ? '0px' : '50%'};
                    box-shadow: 0 0 8px ${primaryColor}; pointer-events: none;"></div>
        <div style="position: absolute; left: -2px; top: -2px; width: 4px; height: 4px;
                    background: ${primaryColor}; border-radius: 50%;"></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });

  // Midpoint readout badge icon
  const midLat = (startPoint.lat + endPoint.lat) / 2;
  const midLon = (startPoint.lon + endPoint.lon) / 2;
  const distStr = distanceNm !== null ? distanceNm.toFixed(1) : '0.0';
  const brgStr = bearingDeg !== null ? Math.round(bearingDeg).toString().padStart(3, '0') : '000';
  const reciprocalBrg = bearingDeg !== null ? Math.round((bearingDeg + 180) % 360).toString().padStart(3, '0') : '000';

  // Approximate time at typical speeds
  const dist = distanceNm || 0;
  const time250Kts = dist > 0 ? (dist / 250) * 60 : 0; // minutes
  const timeStr250 = `${Math.floor(time250Kts)}m${Math.round((time250Kts % 1) * 60)}s`;

  const readoutIcon = L.divIcon({
    className: 'ruler-readout-icon',
    html: `
      <div style="position: relative; width: 0; height: 0; pointer-events: auto;">
        <div style="position: absolute; transform: translate(-50%, -120%);
                    background: rgba(8, 16, 22, 0.96); border: 1.5px solid ${secondaryColor};
                    border-radius: ${isClassic ? '0px' : '3px'}; padding: 3px 7px;
                    font-family: 'JetBrains Mono', Consolas, monospace; font-size: 10px; font-weight: 800;
                    color: ${secondaryColor}; white-space: nowrap; box-shadow: 0 0 14px rgba(0,0,0,0.9);
                    display: flex; align-items: center; gap: 6px;">
          <span style="color: ${primaryColor}; font-size: 11px;">📐 ${distStr} NM</span>
          <span style="opacity: 0.85;">CAP ${brgStr}° (${reciprocalBrg}°)</span>
          <span style="font-size: 9px; opacity: 0.7; border-left: 1px solid rgba(255,255,255,0.2); padding-left: 4px;">~${timeStr250} @250kt</span>
          <button data-ruler-clear="true"
                  style="margin-left: 4px; background: rgba(255,50,50,0.2); border: 1px solid #ff4455;
                         color: #ff4455; border-radius: 2px; width: 14px; height: 14px; display: inline-flex;
                         align-items: center; justify-content: center; font-size: 9px; cursor: pointer;"
                  title="Effacer la règle (Echap)">✕</button>
        </div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });

  return (
    <>
      {/* Dashed measurement line */}
      <Polyline
        positions={[
          [startPoint.lat, startPoint.lon],
          [endPoint.lat, endPoint.lon],
        ]}
        pathOptions={{
          color: isLocked ? primaryColor : secondaryColor,
          weight: 2,
          dashArray: '5, 5',
          opacity: 0.95,
        }}
        interactive={false}
      />

      {/* Start crosshair */}
      <Marker
        position={[startPoint.lat, startPoint.lon]}
        icon={startIcon}
        interactive={false}
      />

      {/* End crosshair */}
      <Marker
        position={[endPoint.lat, endPoint.lon]}
        icon={endIcon}
        interactive={false}
      />

      {/* Floating Readout Badge */}
      <Marker
        position={[midLat, midLon]}
        icon={readoutIcon}
        interactive={true}
        eventHandlers={{
          click: (e) => {
            const target = e.originalEvent.target as HTMLElement;
            if (target && target.getAttribute('data-ruler-clear')) {
              e.originalEvent.stopPropagation();
              clearRuler();
            }
          },
        }}
      />
    </>
  );
};
