import React, { useMemo } from 'react';
import { Polygon, Polyline, Marker } from 'react-leaflet';
import L from 'leaflet';
import { useAirportStore } from '../../store/useAirportStore';
import { useRadarSettingsStore } from '../../store/useRadarSettingsStore';
import {
  calculateApproachCenterline,
  calculateLocalizerFeather,
  calculateRunwayPolygon,
} from '../../utils/aviationMath';

export const RunwayCorridor: React.FC = () => {
  const currentAirport = useAirportStore((state) => state.currentAirport);
  const activeRunwayId = useAirportStore((state) => state.activeRunwayId);
  const getActiveRunwayEnd = useAirportStore((state) => state.getActiveRunwayEnd);

  const showExtendedCenterlines = useRadarSettingsStore(
    (state) => state.showExtendedCenterlines
  );
  const showIlsFeather = useRadarSettingsStore((state) => state.showIlsFeather);
  const declutterLevel = useRadarSettingsStore((state) => state.declutterLevel);

  const activeRunwayEnd = getActiveRunwayEnd();
  const isClean = declutterLevel === 'clean' || declutterLevel === 'minimal';

  // Render physical runway polygons for all runways at this airport
  const runwayPolygons = useMemo(() => {
    if (!currentAirport) return [];

    return currentAirport.runways.map((rwy) => {
      // Calculate polygon from threshold 1 along heading 1
      const coords = calculateRunwayPolygon(
        rwy.end1.threshold.lat,
        rwy.end1.threshold.lon,
        rwy.end1.heading,
        rwy.lengthMeters,
        rwy.widthMeters || 45
      );

      const isActive =
        rwy.end1.id === activeRunwayId || rwy.end2.id === activeRunwayId;

      return {
        rwy,
        coords,
        isActive,
      };
    });
  }, [currentAirport, activeRunwayId]);

  // Extended approach centerline & graduation ticks for active runway end
  const approachData = useMemo(() => {
    if (!activeRunwayEnd || !showExtendedCenterlines) return null;

    return calculateApproachCenterline(
      activeRunwayEnd.threshold.lat,
      activeRunwayEnd.threshold.lon,
      activeRunwayEnd.heading,
      15
    );
  }, [activeRunwayEnd, showExtendedCenterlines]);

  // ILS feather / localizer cone for active runway
  const featherCoords = useMemo(() => {
    if (!activeRunwayEnd || !showIlsFeather) return null;

    return calculateLocalizerFeather(
      activeRunwayEnd.threshold.lat,
      activeRunwayEnd.threshold.lon,
      activeRunwayEnd.heading,
      10, // 10 NM length
      2.8 // 2.8° half-angle
    );
  }, [activeRunwayEnd, showIlsFeather]);

  if (!currentAirport) return null;

  return (
    <>
      {/* ILS Localizer Feather Cone */}
      {featherCoords && (
        <Polygon
          positions={featherCoords}
          pathOptions={{
            color: '#00e5ff',
            weight: 1,
            dashArray: '3, 4',
            opacity: isClean ? 0.3 : 0.45,
            fillColor: '#00e5ff',
            fillOpacity: isClean ? 0.03 : 0.05,
          }}
        />
      )}

      {/* Extended Approach Centerline & Graduation Ticks */}
      {approachData && (
        <>
          {/* Main 15 NM Centerline */}
          <Polyline
            positions={approachData.centerline}
            pathOptions={{
              color: '#00ff66',
              weight: 1.2,
              opacity: isClean ? 0.5 : 0.7,
              dashArray: '5, 5',
            }}
          />

          {/* 1 NM and 5 NM Graduation Ticks */}
          {approachData.ticks.map((tick) => {
            const tickPositions: [number, number][] = [tick.start, tick.end];

            const distLabelIcon =
              tick.isMajor && declutterLevel !== 'minimal'
                ? L.divIcon({
                    className: 'approach-tick-label',
                    html: `<div style="color: #00ff66; font-size: 8px; font-weight: 700; font-family: 'JetBrains Mono', monospace; opacity: ${isClean ? 0.75 : 0.9}; transform: translate(4px, -5px);">${tick.distanceNm}</div>`,
                    iconSize: [0, 0],
                    iconAnchor: [0, 0],
                  })
                : null;

            return (
              <React.Fragment key={`tick-${tick.distanceNm}`}>
                <Polyline
                  positions={tickPositions}
                  pathOptions={{
                    color: tick.isMajor ? '#00ff66' : '#00bb4a',
                    weight: tick.isMajor ? 1.5 : 0.8,
                    opacity: tick.isMajor ? (isClean ? 0.6 : 0.8) : 0.3,
                  }}
                />
                {distLabelIcon && (
                  <Marker
                    position={tick.center}
                    icon={distLabelIcon}
                    interactive={false}
                  />
                )}
              </React.Fragment>
            );
          })}
        </>
      )}

      {/* Physical Runway Strips */}
      {runwayPolygons.map(({ rwy, coords, isActive }) => {
        const threshold1Icon = L.divIcon({
          className: 'rwy-threshold-label',
          html: `<div style="color: ${
            rwy.end1.id === activeRunwayId ? '#00ff66' : '#009944'
          }; font-size: 9px; font-weight: 700; font-family: 'JetBrains Mono', monospace; background: rgba(10,15,20,0.85); border: 1px solid ${
            rwy.end1.id === activeRunwayId ? '#00ff66' : '#1a3328'
          }; padding: 0 2px; border-radius: 2px; transform: translate(-50%, -50%);">${
            rwy.end1.id
          }</div>`,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        });

        const threshold2Icon = L.divIcon({
          className: 'rwy-threshold-label',
          html: `<div style="color: ${
            rwy.end2.id === activeRunwayId ? '#00ff66' : '#009944'
          }; font-size: 9px; font-weight: 700; font-family: 'JetBrains Mono', monospace; background: rgba(10,15,20,0.85); border: 1px solid ${
            rwy.end2.id === activeRunwayId ? '#00ff66' : '#1a3328'
          }; padding: 0 2px; border-radius: 2px; transform: translate(-50%, -50%);">${
            rwy.end2.id
          }</div>`,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        });

        return (
          <React.Fragment key={rwy.id}>
            <Polygon
              positions={coords}
              pathOptions={{
                color: isActive ? '#00ff66' : '#00aa55',
                weight: isActive ? 1.8 : 1,
                fillColor: '#0a1a15',
                fillOpacity: 0.8,
              }}
            />
            {/* Threshold Labels */}
            <Marker
              position={[rwy.end1.threshold.lat, rwy.end1.threshold.lon]}
              icon={threshold1Icon}
              interactive={false}
            />
            <Marker
              position={[rwy.end2.threshold.lat, rwy.end2.threshold.lon]}
              icon={threshold2Icon}
              interactive={false}
            />
          </React.Fragment>
        );
      })}

      {/* Aerodrome Reference Point (ARP) Crosshair Marker */}
      <Marker
        position={[currentAirport.lat, currentAirport.lon]}
        icon={L.divIcon({
          className: 'arp-marker',
          html: `<div style="color: #00e5ff; font-size: 8px; font-family: 'JetBrains Mono', monospace; background: rgba(10,15,20,0.6); border: 1px dashed #00e5ff88; border-radius: 50%; width: 10px; height: 10px; display: flex; align-items: center; justify-content: center; transform: translate(-50%, -50%);"><span>+</span></div>`,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        })}
        interactive={false}
      />
    </>
  );
};
