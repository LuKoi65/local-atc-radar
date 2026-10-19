import React from 'react';
import { Polygon, Polyline, Marker } from 'react-leaflet';
import L from 'leaflet';
import { AIRSPACES_PRESET } from '../../data/aeronautical/airspaces';
import { NAVAIDS_PRESET } from '../../data/aeronautical/navaids';
import { WAYPOINTS_PRESET } from '../../data/aeronautical/waypoints';
import { STARS_PRESET } from '../../data/aeronautical/stars';
import { useRadarSettingsStore } from '../../store/useRadarSettingsStore';

export const AeronauticalLayer: React.FC = () => {
  const showAirspaces = useRadarSettingsStore((state) => state.showAirspaces);
  const showNavaids = useRadarSettingsStore((state) => state.showNavaids);
  const showWaypoints = useRadarSettingsStore((state) => state.showWaypoints);
  const showStars = useRadarSettingsStore((state) => state.showStars);
  const declutterLevel = useRadarSettingsStore((state) => state.declutterLevel);

  // In minimal declutter mode, text labels are minimized
  const hideText = declutterLevel === 'minimal';
  const isClean = declutterLevel === 'clean';

  return (
    <>
      {/* 1. Controlled Airspaces (CTR / TMA / LF-R) */}
      {showAirspaces &&
        AIRSPACES_PRESET.map((airspace) => {
          // Anchor label at the Northernmost boundary point to prevent colliding with airport center
          let northPoint = airspace.polygon[0];
          for (const pt of airspace.polygon) {
            if (pt[0] > northPoint[0]) {
              northPoint = pt;
            }
          }

          const labelIcon = !hideText
            ? L.divIcon({
                className: 'airspace-label',
                html: `
                  <div style="color: ${airspace.color}; font-size: ${isClean ? '8px' : '9px'}; font-weight: 700; font-family: 'JetBrains Mono', monospace;
                              background: rgba(10, 15, 20, 0.7); border: 1px dashed ${airspace.color}88; padding: 1px 3px;
                              border-radius: 2px; white-space: nowrap; transform: translate(-50%, -100%); opacity: ${isClean ? 0.6 : 0.85};">
                    ${airspace.name} [${airspace.classification}] ${airspace.floor}/${airspace.ceiling}
                  </div>
                `,
                iconSize: [0, 0],
                iconAnchor: [0, 0],
              })
            : null;

          return (
            <React.Fragment key={airspace.id}>
              <Polygon
                positions={airspace.polygon}
                pathOptions={{
                  color: airspace.color,
                  weight: 1.2,
                  dashArray: airspace.classification === 'D' ? '4, 4' : '6, 6',
                  opacity: isClean ? 0.35 : 0.5,
                  fillColor: airspace.color,
                  fillOpacity: isClean ? 0.02 : 0.04,
                }}
              />
              {labelIcon && <Marker position={northPoint} icon={labelIcon} interactive={false} />}
            </React.Fragment>
          );
        })}

      {/* 2. Standard Terminal Arrival Routes (STARs) */}
      {showStars &&
        STARS_PRESET.map((star) => {
          const positions: [number, number][] = star.points.map((pt) => [pt.lat, pt.lon]);

          // IMPORTANT: Position the STAR label at the ENTRY waypoint (first point), far away from airport!
          const entryPt = star.points[0];

          const routeTagIcon = !hideText
            ? L.divIcon({
                className: 'star-tag',
                html: `
                  <div style="color: ${star.color}; font-size: 8px; font-weight: 700; font-family: 'JetBrains Mono', monospace;
                              background: rgba(10, 15, 20, 0.75); border: 1px solid ${star.color}66; padding: 1px 3px;
                              border-radius: 2px; white-space: nowrap; transform: translate(-50%, -140%); opacity: ${isClean ? 0.7 : 0.9};">
                    ✈ ${star.name}
                  </div>
                `,
                iconSize: [0, 0],
                iconAnchor: [0, 0],
              })
            : null;

          return (
            <React.Fragment key={star.id}>
              <Polyline
                positions={positions}
                pathOptions={{
                  color: star.color,
                  weight: 1.2,
                  opacity: isClean ? 0.35 : 0.5,
                  dashArray: '4, 6',
                }}
              />
              {routeTagIcon && (
                <Marker position={[entryPt.lat, entryPt.lon]} icon={routeTagIcon} interactive={false} />
              )}
            </React.Fragment>
          );
        })}

      {/* 3. Radio Navaids (VOR/DME, NDB) */}
      {showNavaids &&
        NAVAIDS_PRESET.map((nav) => {
          const navaidHtml = `
            <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -50%); cursor: default; opacity: ${isClean ? 0.75 : 0.9};">
              <!-- VOR Compass Hexagon / Symbol -->
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" stroke-width="2">
                <polygon points="12,2 22,8 22,16 12,22 2,16 2,8" stroke-dasharray="${nav.type === 'NDB' ? '2,2' : 'none'}" />
                <circle cx="12" cy="12" r="2.5" fill="#00e5ff" />
              </svg>
              <!-- Label -->
              ${
                !hideText
                  ? `<div style="color: #00e5ff; font-size: 8px; font-weight: 700; font-family: 'JetBrains Mono', monospace; 
                              white-space: nowrap; margin-top: 1px; background: rgba(10,15,20,0.7); padding: 0 2px; border-radius: 2px;">
                       ${nav.ident} ${!isClean ? `<span style="opacity: 0.7;">${nav.frequency}</span>` : ''}
                     </div>`
                  : ''
              }
            </div>
          `;

          const navIcon = L.divIcon({
            className: 'navaid-marker',
            html: navaidHtml,
            iconSize: [0, 0],
            iconAnchor: [0, 0],
          });

          return (
            <Marker
              key={nav.ident}
              position={[nav.lat, nav.lon]}
              icon={navIcon}
              interactive={false}
            />
          );
        })}

      {/* 4. RNAV / Terminal Fixes (Waypoints) */}
      {showWaypoints &&
        WAYPOINTS_PRESET.map((wpt) => {
          // In clean/minimal modes, filter out local minor terminal points to avoid clutter near runway
          if (isClean && wpt.type === 'TERMINAL') {
            return null;
          }

          const wptHtml = `
            <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -50%); cursor: default; opacity: ${isClean ? 0.65 : 0.85};">
              <!-- RNAV Triangle -->
              <svg width="10" height="10" viewBox="0 0 20 20" fill="none" stroke="#00ff66" stroke-width="2">
                <polygon points="10,2 19,18 1,18" />
              </svg>
              ${
                !hideText
                  ? `<div style="color: #00ff66; font-size: 8px; font-weight: 700; font-family: 'JetBrains Mono', monospace; 
                              white-space: nowrap; margin-top: 1px; background: rgba(10,15,20,0.7); padding: 0 2px;">
                       ${wpt.name}
                     </div>`
                  : ''
              }
            </div>
          `;

          const wptIcon = L.divIcon({
            className: 'waypoint-marker',
            html: wptHtml,
            iconSize: [0, 0],
            iconAnchor: [0, 0],
          });

          return (
            <Marker
              key={wpt.name}
              position={[wpt.lat, wpt.lon]}
              icon={wptIcon}
              interactive={false}
            />
          );
        })}
    </>
  );
};
