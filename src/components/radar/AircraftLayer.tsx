import React, { useMemo } from 'react';
import { Marker, Polyline, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { Aircraft } from '../../services/adsb/types';
import { useTrafficStore } from '../../store/useTrafficStore';
import { useRadarSettingsStore } from '../../store/useRadarSettingsStore';
import { useAirportStore } from '../../store/useAirportStore';
import {
  calculateSpeedVectorEnd,
  formatAltitude,
  formatSpeed,
  formatVerticalTrend,
  inspectSquawk,
} from '../../utils/aviationMath';

export const AircraftLayer: React.FC = () => {
  const aircraftList = useTrafficStore((state) => state.aircraftList);
  const selectedHex = useTrafficStore((state) => state.selectedHex);
  const selectAircraft = useTrafficStore((state) => state.selectAircraft);

  const vectorLengthMin = useRadarSettingsStore((state) => state.vectorLengthMin);
  const filterEnabled = useRadarSettingsStore((state) => state.filterEnabled);
  const altMin = useRadarSettingsStore((state) => state.altitudeFilterMin);
  const altMax = useRadarSettingsStore((state) => state.altitudeFilterMax);
  const tagOffsets = useRadarSettingsStore((state) => state.tagOffsets);
  const guiTheme = useRadarSettingsStore((state) => state.guiTheme);
  const currentAirport = useAirportStore((state) => state.currentAirport);

  // Filter aircraft by altitude if filter is active
  const visibleAircraft = useMemo(() => {
    return aircraftList.filter((ac) => {
      if (filterEnabled) {
        if (ac.altitudeFt < altMin || ac.altitudeFt > altMax) {
          return false;
        }
      }
      return true;
    });
  }, [aircraftList, filterEnabled, altMin, altMax]);

  return (
    <>
      {visibleAircraft.map((ac) => {
        const isSelected = ac.hex === selectedHex;
        const squawkInfo = inspectSquawk(ac.squawk);
        const isEmergency = squawkInfo.isEmergency;

        // Theme colors
        let mainColor = '#00ff66'; // phosphor green
        let dataTagBg = 'rgba(10, 20, 16, 0.92)';
        let borderCol = 'rgba(0, 255, 102, 0.45)';

        if (isEmergency) {
          mainColor = '#ff3344'; // emergency red
          dataTagBg = 'rgba(40, 10, 15, 0.95)';
          borderCol = '#ff3344';
        } else if (isSelected) {
          mainColor = '#00e5ff'; // cyan for selected
          dataTagBg = 'rgba(10, 25, 35, 0.96)';
          borderCol = '#00e5ff';
        }

        // Speed leader calculation
        const speedEnd = calculateSpeedVectorEnd(
          ac.lat,
          ac.lon,
          ac.trackDeg,
          ac.groundSpeedKts,
          vectorLengthMin
        );

        // Formatted ATC tag elements
        const altStr = formatAltitude(ac.altitudeFt, currentAirport?.transitionAltitudeFt || 5000);
        const trend = formatVerticalTrend(ac.baroRateFpm);
        const spdStr = formatSpeed(ac.groundSpeedKts);
        const flagHtml =
          ac.countryCode && ac.countryCode.length === 2 && ac.countryCode !== 'XX' && ac.countryCode !== 'INT'
            ? `<img src="https://flagcdn.com/20x15/${ac.countryCode.toLowerCase()}.png" alt="${ac.country || ac.countryCode}" title="${ac.country || ac.countryCode}" style="width: 13px; height: 9px; object-fit: cover; display: inline-block; vertical-align: middle; margin-right: 3px; border-radius: 1px; border: 0.5px solid rgba(255,255,255,0.3);" onerror="this.style.display='none'" />`
            : '';

        // Movable tag offset from store
        const offset = tagOffsets[ac.hex] || { x: 38, y: -38 };

        // HTML icon for target blip + dynamic leader line + movable 3-line data tag
        const isClassic = guiTheme === 'classic';
        const iconHtml = `
          <div class="relative pointer-events-auto select-none" style="width: 0; height: 0;">
            <!-- Target Blip Center at (0, 0) -->
            <div data-select-hex="${ac.hex}"
                 style="position: absolute; left: -5px; top: -5px; width: 10px; height: 10px; 
                        background: ${mainColor}; border: 1px solid ${isSelected ? '#ffffff' : isClassic ? '#000000' : '#ffffff'}; transform: rotate(45deg);
                        ${isClassic ? '' : `box-shadow: 0 0 8px ${mainColor};`} cursor: pointer;">
            </div>

            <!-- Selected Acquisition Brackets (Square reticle in classic mode, rotating circle in modern) -->
            ${
              isSelected
                ? isClassic
                  ? `<div style="position: absolute; left: -11px; top: -11px; width: 22px; height: 22px;
                                border: 1.5px solid #00e5ff; pointer-events: none;"></div>`
                  : `<div class="animate-spin" style="position: absolute; left: -14px; top: -14px; width: 28px; height: 28px;
                                border: 1.5px dashed #00e5ff; border-radius: 50%; pointer-events: none;"></div>`
                : ''
            }

            <!-- Dynamic Tag Leader Line (SVG) from (0,0) to tag offset -->
            <svg style="position: absolute; left: 0; top: 0; width: 1px; height: 1px; overflow: visible; pointer-events: none;">
              <line x1="0" y1="0" x2="${offset.x}" y2="${offset.y}" 
                    stroke="${mainColor}" stroke-width="${isClassic ? '1' : '1.2'}" stroke-dasharray="${isSelected ? 'none' : '2, 2'}" opacity="0.85" />
            </svg>

            <!-- Movable 3-Line ATC Data Tag -->
            <div data-drag-hex="${ac.hex}"
                 title="Drag to move tag | Double-click to reset position"
                 style="position: absolute; left: ${offset.x}px; top: ${offset.y}px; 
                        background: ${isClassic ? '#070c0a' : dataTagBg}; border: ${isClassic ? '1px solid ' + borderCol : '1.5px solid ' + borderCol};
                        border-radius: ${isClassic ? '0px' : '2px'}; padding: 2px 6px; font-family: 'JetBrains Mono', Consolas, monospace;
                        font-size: 11px; line-height: 1.25; color: ${mainColor};
                        box-shadow: ${isClassic ? 'none' : '0 3px 10px rgba(0,0,0,0.85)'}; min-width: 90px; z-index: ${isSelected ? 1000 : 500};
                        cursor: grab; user-select: none;">
              
              <!-- Line 1: Callsign & Type -->
              <div style="display: flex; justify-content: space-between; align-items: baseline; font-weight: 700; letter-spacing: 0.5px;">
                <span>${ac.flight}</span>
                <span style="opacity: 0.9; margin-left: 6px; font-size: 10px; color: #00e5ff;">${ac.type}</span>
              </div>

              <!-- Line 2: Altitude, Trend, Ground Speed -->
              <div style="display: flex; gap: 4px; align-items: center; color: ${isSelected ? '#ffffff' : mainColor}; font-weight: 700;">
                <span>${altStr}</span>
                <span style="color: ${trend.symbol === '↑' ? '#00e5ff' : trend.symbol === '↓' ? '#ffaa00' : '#4a6764'}; font-size: 12px; font-weight: 800;">
                  ${trend.symbol}
                </span>
                <span style="margin-left: auto;">${spdStr}</span>
              </div>

              <!-- Line 3: Squawk, Flag / Alert -->
              <div style="font-size: 9px; opacity: 0.85; display: flex; justify-content: space-between; align-items: center; margin-top: 1px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 1px;">
                <span>SQ:${ac.squawk}</span>
                <span style="margin-left: 4px; display: inline-flex; align-items: center;">
                  ${flagHtml}
                  ${
                    isEmergency
                      ? `<span style="color: #ff3344; font-weight: bold;" class="animate-pulse">${squawkInfo.alertType}</span>`
                      : `<span style="opacity: 0.7;">${ac.isGround ? 'GND' : 'AIR'}</span>`
                  }
                </span>
              </div>
            </div>
          </div>
        `;

        const customIcon = L.divIcon({
          className: 'aircraft-target-marker',
          html: iconHtml,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        });

        return (
          <React.Fragment key={ac.hex}>
            {/* Speed Leader Vector Line */}
            {ac.groundSpeedKts > 20 && speedEnd.distanceNm > 0 && (
              <Polyline
                positions={[
                  [ac.lat, ac.lon],
                  [speedEnd.lat, speedEnd.lon],
                ]}
                pathOptions={{
                  color: isSelected ? '#00e5ff' : mainColor,
                  weight: isSelected ? 2 : 1.5,
                  opacity: 0.85,
                }}
              />
            )}

            {/* History Trail Dots (up to 5 dots with fading opacity) */}
            {ac.history.map((pt, idx) => {
              const totalDots = ac.history.length;
              const opacity = 0.15 + (idx / Math.max(1, totalDots)) * 0.65;
              const radius = 1.5 + (idx / Math.max(1, totalDots)) * 1.5;

              return (
                <CircleMarker
                  key={`hist-${ac.hex}-${idx}`}
                  center={[pt.lat, pt.lon]}
                  radius={radius}
                  pathOptions={{
                    color: mainColor,
                    fillColor: mainColor,
                    fillOpacity: opacity,
                    weight: 0,
                  }}
                  interactive={false}
                />
              );
            })}

            {/* Main Aircraft Target Blip + Tag */}
            <Marker
              position={[ac.lat, ac.lon]}
              icon={customIcon}
              eventHandlers={{
                click: () => {
                  selectAircraft(isSelected ? null : ac.hex);
                },
              }}
            />
          </React.Fragment>
        );
      })}
    </>
  );
};
