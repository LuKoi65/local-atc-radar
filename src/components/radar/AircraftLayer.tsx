import React, { useMemo } from 'react';
import { Marker, Polyline, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { Aircraft } from '../../services/adsb/types';
import { useTrafficStore } from '../../store/useTrafficStore';
import { useRadarSettingsStore, TagOffset } from '../../store/useRadarSettingsStore';
import { useAirportStore } from '../../store/useAirportStore';
import { detectStcaConflicts } from '../../services/radar/stcaService';
import {
  calculateSpeedVectorEnd,
  formatAltitude,
  formatSpeed,
  formatVerticalTrend,
  inspectSquawk,
} from '../../utils/aviationMath';

/**
 * Calculates optimal 4-quadrant tag leader line placement
 * to automatically prevent overlapping between proximate aircraft.
 */
function getSmartTagOffset(
  ac: Aircraft,
  allAircraft: Aircraft[],
  manualOffset?: TagOffset
): TagOffset {
  if (manualOffset) return manualOffset;

  // 4 Quadrants: Top-Right (default), Top-Left, Bottom-Right, Bottom-Left
  const CANDIDATES: { offset: TagOffset; dxNm: number; dyNm: number }[] = [
    { offset: { x: 38, y: -38 }, dxNm: 1.5, dyNm: 1.5 },
    { offset: { x: -88, y: -38 }, dxNm: -2.5, dyNm: 1.5 },
    { offset: { x: 38, y: 35 }, dxNm: 1.5, dyNm: -1.5 },
    { offset: { x: -88, y: 35 }, dxNm: -2.5, dyNm: -1.5 },
  ];

  // Nearby aircraft within ~8 NM
  const neighbors = allAircraft.filter(
    (other) =>
      other.hex !== ac.hex &&
      Math.abs(other.lat - ac.lat) < 0.14 &&
      Math.abs(other.lon - ac.lon) < 0.2
  );

  if (neighbors.length === 0) {
    return CANDIDATES[0].offset;
  }

  let bestScore = -Infinity;
  let bestOffset = CANDIDATES[0].offset;

  for (const cand of CANDIDATES) {
    let minDistanceToNeighbor = Infinity;
    for (const nb of neighbors) {
      const dLat = (nb.lat - ac.lat) * 60;
      const dLon = (nb.lon - ac.lon) * 60 * Math.cos((ac.lat * Math.PI) / 180);
      const distFromTag = Math.hypot(dLon - cand.dxNm, dLat - cand.dyNm);
      if (distFromTag < minDistanceToNeighbor) {
        minDistanceToNeighbor = distFromTag;
      }
    }
    if (minDistanceToNeighbor > bestScore) {
      bestScore = minDistanceToNeighbor;
      bestOffset = cand.offset;
    }
  }

  return bestOffset;
}

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
  const customColors = useRadarSettingsStore((state) => state.customColors);
  const currentAirport = useAirportStore((state) => state.currentAirport);

  // New modules settings
  const stcaEnabled = useRadarSettingsStore((state) => state.stcaEnabled);
  const mutedConflictIds = useRadarSettingsStore((state) => state.mutedConflictIds);
  const trailLengthMode = useRadarSettingsStore((state) => state.trailLengthMode);
  const tagDisplayMode = useRadarSettingsStore((state) => state.tagDisplayMode);
  const autoDeconflictTags = useRadarSettingsStore((state) => state.autoDeconflictTags);

  const activeColors = guiTheme === 'classic' ? customColors?.classic : customColors?.modern;
  const primaryColor = activeColors?.primary || '#00ff66';
  const secondaryColor = activeColors?.secondary || '#00e5ff';
  const amberColor = activeColors?.amber || '#ffaa00';
  const mutedColor = activeColors?.muted || '#94a8a4';

  // Conflict detection for visual flashing
  const { conflictHexMap } = useMemo(() => {
    if (!stcaEnabled || aircraftList.length < 2) {
      return { conflictHexMap: new Map() };
    }
    return detectStcaConflicts(aircraftList, mutedConflictIds);
  }, [aircraftList, stcaEnabled, mutedConflictIds]);

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

  const now = Date.now();

  return (
    <>
      {visibleAircraft.map((ac) => {
        const isSelected = ac.hex === selectedHex;
        const squawkInfo = inspectSquawk(ac.squawk);
        const isEmergency = squawkInfo.isEmergency;
        const conflictLevel = conflictHexMap.get(ac.hex);

        // Theme colors & STCA alert styles
        let mainColor = primaryColor;
        let dataTagBg = 'rgba(8, 14, 20, 0.96)';
        let borderCol = primaryColor;

        if (isEmergency) {
          mainColor = '#ff3344';
          dataTagBg = 'rgba(40, 10, 15, 0.96)';
          borderCol = '#ff3344';
        } else if (conflictLevel === 'warning') {
          mainColor = '#ff2244';
          dataTagBg = 'rgba(45, 10, 15, 0.96)';
          borderCol = '#ff2244';
        } else if (conflictLevel === 'caution') {
          mainColor = '#ffaa00';
          dataTagBg = 'rgba(35, 20, 10, 0.96)';
          borderCol = '#ffaa00';
        } else if (isSelected) {
          mainColor = secondaryColor;
          dataTagBg = 'rgba(10, 25, 35, 0.96)';
          borderCol = secondaryColor;
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

        // Dynamic anti-overlap or manual tag offset
        const offset = autoDeconflictTags
          ? getSmartTagOffset(ac, visibleAircraft, tagOffsets[ac.hex])
          : tagOffsets[ac.hex] || { x: 38, y: -38 };

        // HTML icon for target blip + dynamic leader line + customizable ATC data tag
        const isClassic = guiTheme === 'classic';

        // Filter history breadcrumbs according to trailLengthMode (capped to 3-8 dots max for high FPS performance)
        const maxDots = trailLengthMode === '1min' ? 3 : trailLengthMode === '3min' ? 5 : 8;
        const historyPoints = (ac.history || [])
          .filter((pt) => {
            if (trailLengthMode === 'off') return false;
            if (trailLengthMode === '1min') return now - pt.timestamp <= 60000;
            if (trailLengthMode === '3min') return now - pt.timestamp <= 180000;
            return true;
          })
          .slice(-maxDots);

        // Generate lines based on tagDisplayMode (compact / standard / extended)
        let tagBodyHtml = '';
        if (tagDisplayMode === 'compact') {
          tagBodyHtml = `
            <div style="font-weight: 800; letter-spacing: 0.5px;">${ac.flight}</div>
            <div style="display: flex; gap: 4px; align-items: center; color: ${isSelected ? '#ffffff' : mainColor}; font-weight: 700;">
              <span>${altStr}</span>
              <span style="color: ${trend.symbol === '↑' ? secondaryColor : trend.symbol === '↓' ? amberColor : mutedColor}; font-size: 11px;">${trend.symbol}</span>
            </div>
          `;
        } else if (tagDisplayMode === 'extended') {
          const speedExtra = ac.iasKts ? ` IAS:${ac.iasKts}` : ac.mach ? ` M${ac.mach.toFixed(2)}` : '';
          tagBodyHtml = `
            <!-- Line 1: Flag, Callsign, Type -->
            <div style="display: flex; justify-content: space-between; align-items: baseline; font-weight: 700;">
              <span>${flagHtml}${ac.flight}</span>
              <span style="font-size: 9.5px; color: ${secondaryColor};">${ac.type}</span>
            </div>
            <!-- Line 2: Altitude, Trend, Speed & Mach -->
            <div style="display: flex; gap: 4px; align-items: center; color: ${isSelected ? '#ffffff' : mainColor}; font-weight: 700;">
              <span>${altStr}</span>
              <span style="color: ${trend.symbol === '↑' ? secondaryColor : trend.symbol === '↓' ? amberColor : mutedColor}; font-size: 12px; font-weight: 800;">${trend.symbol}</span>
              <span style="margin-left: auto;">${spdStr} <span style="font-size: 8.5px; opacity: 0.75;">${speedExtra}</span></span>
            </div>
            <!-- Line 3: Reg, Squawk, Operator -->
            <div style="font-size: 9px; opacity: 0.85; display: flex; justify-content: space-between; align-items: center; margin-top: 1px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 1px;">
              <span>${ac.registration || ''} SQ:${ac.squawk}</span>
              <span style="margin-left: 4px; max-width: 60px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; opacity: 0.8;">${ac.operator || ''}</span>
            </div>
          `;
        } else {
          // Standard (3-line default)
          tagBodyHtml = `
            <!-- Line 1: Callsign & Type -->
            <div style="display: flex; justify-content: space-between; align-items: baseline; font-weight: 700; letter-spacing: 0.5px;">
              <span>${ac.flight}</span>
              <span style="opacity: 0.9; margin-left: 6px; font-size: 10px; color: ${secondaryColor};">${ac.type}</span>
            </div>

            <!-- Line 2: Altitude, Trend, Ground Speed -->
            <div style="display: flex; gap: 4px; align-items: center; color: ${isSelected ? '#ffffff' : mainColor}; font-weight: 700;">
              <span>${altStr}</span>
              <span style="color: ${trend.symbol === '↑' ? secondaryColor : trend.symbol === '↓' ? amberColor : mutedColor}; font-size: 12px; font-weight: 800;">
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
                    ? `<span style="color: #ff3344; font-weight: bold;" class="stca-warning-strobe">${squawkInfo.alertType}</span>`
                    : conflictLevel === 'warning'
                    ? `<span style="background: #ff2244; color: #fff; padding: 0 3px; border-radius: 1px; font-weight: 900;" class="stca-warning-strobe">STCA</span>`
                    : conflictLevel === 'caution'
                    ? `<span style="background: #ffaa00; color: #000; padding: 0 3px; border-radius: 1px; font-weight: 900;">PROX</span>`
                    : `<span style="opacity: 0.7;">${ac.isGround ? 'GND' : 'AIR'}</span>`
                }
              </span>
            </div>
          `;
        }

        const iconHtml = `
          <div class="relative pointer-events-auto select-none" style="width: 0; height: 0;">
            <!-- Target Blip Center at (0, 0) -->
            <div data-select-hex="${ac.hex}"
                 style="position: absolute; left: -5px; top: -5px; width: 10px; height: 10px; 
                        background: ${mainColor}; border: 1px solid ${isSelected ? '#ffffff' : isClassic ? '#000000' : '#ffffff'}; transform: rotate(45deg);
                        ${isClassic ? '' : `box-shadow: 0 0 8px ${mainColor};`} cursor: pointer;">
            </div>

            <!-- STCA Conflict Hazard Reticle (Square Target Brackets) -->
            ${
              conflictLevel === 'warning'
                ? `<div class="stca-warning-strobe" style="position: absolute; left: -9px; top: -9px; width: 18px; height: 18px; border: 2px solid #ff2244; pointer-events: none;"></div>`
                : ''
            }

            <!-- Selected Acquisition Brackets -->
            ${
              isSelected
                ? isClassic
                  ? `<div style="position: absolute; left: -11px; top: -11px; width: 22px; height: 22px;
                                border: 1.5px solid ${secondaryColor}; pointer-events: none;"></div>`
                  : `<div class="animate-spin" style="position: absolute; left: -14px; top: -14px; width: 28px; height: 28px;
                                border: 1.5px dashed ${secondaryColor}; border-radius: 50%; pointer-events: none;"></div>`
                : ''
            }

            <!-- Dynamic Tag Leader Line (SVG) from (0,0) to tag offset -->
            <svg style="position: absolute; left: 0; top: 0; width: 1px; height: 1px; overflow: visible; pointer-events: none;">
              <line x1="0" y1="0" x2="${offset.x}" y2="${offset.y}" 
                    stroke="${mainColor}" stroke-width="${isClassic ? '1' : '1.2'}" stroke-dasharray="${isSelected ? 'none' : '2, 2'}" opacity="0.85" />
            </svg>

            <!-- Movable & Customizable ATC Data Tag -->
            <div data-drag-hex="${ac.hex}"
                 title="Drag to move tag | Double-click to reset position"
                 class="${conflictLevel === 'warning' ? 'stca-warning-strobe' : ''}"
                 style="position: absolute; left: ${offset.x}px; top: ${offset.y}px; 
                        background: ${isClassic ? '#070c0a' : dataTagBg}; border: ${isClassic ? '1px solid ' + borderCol : '1.5px solid ' + borderCol};
                        border-radius: ${isClassic ? '0px' : '2px'}; padding: 2px 6px; font-family: 'JetBrains Mono', Consolas, monospace;
                        font-size: 11px; line-height: 1.25; color: ${mainColor};
                        box-shadow: ${isClassic ? 'none' : '0 3px 12px rgba(0,0,0,0.95)'}; min-width: ${tagDisplayMode === 'compact' ? '70px' : '90px'}; z-index: ${isSelected ? 1000 : 500};
                        cursor: grab; user-select: none;">
              ${tagBodyHtml}
            </div>
          </div>
        `;

        const customIcon = L.divIcon({
          className: 'aircraft-target-marker',
          html: iconHtml,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        });

        // Connected trajectory polyline for selected aircraft
        const selectedTrajectoryPoints: [number, number][] =
          isSelected && ac.history && ac.history.length >= 2
            ? [...ac.history.map((pt) => [pt.lat, pt.lon] as [number, number]), [ac.lat, ac.lon]]
            : [];

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
                  color: isSelected ? secondaryColor : mainColor,
                  weight: isSelected ? 2 : 1.5,
                  opacity: 0.85,
                }}
              />
            )}

            {/* Selected Aircraft Full Track Polyline */}
            {selectedTrajectoryPoints.length > 1 && (
              <Polyline
                positions={selectedTrajectoryPoints}
                pathOptions={{
                  color: secondaryColor,
                  weight: 1.8,
                  opacity: 0.75,
                  dashArray: '3, 4',
                }}
                interactive={false}
              />
            )}

            {/* History Trail Dots (Breadcrumbs with authentic fading phosphor decay) */}
            {historyPoints.map((pt, idx) => {
              const totalDots = historyPoints.length;
              const ratio = idx / Math.max(1, totalDots);
              const opacity = 0.08 + ratio * 0.75;
              const radius = 1.2 + ratio * 2.2;

              return (
                <CircleMarker
                  key={`hist-${ac.hex}-${idx}`}
                  center={[pt.lat, pt.lon]}
                  radius={radius}
                  pathOptions={{
                    color: isSelected ? secondaryColor : mainColor,
                    fillColor: isSelected ? secondaryColor : mainColor,
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
              zIndexOffset={isSelected ? 10000 : 5000}
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
