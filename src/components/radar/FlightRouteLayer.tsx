import React, { useEffect, useState, useMemo } from 'react';
import { Polyline, Marker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useTrafficStore } from '../../store/useTrafficStore';
import { useRadarSettingsStore } from '../../store/useRadarSettingsStore';
import { routeService } from '../../services/adsb/routeService';
import { resolveAirportCoordinates } from '../../data/airports/airportLookup';
import { interpolateGreatCirclePoints } from '../../utils/aviationMath';

export const FlightRouteLayer: React.FC = () => {
  const map = useMap();
  const selectedHex = useTrafficStore((state) => state.selectedHex);
  const getSelectedAircraft = useTrafficStore((state) => state.getSelectedAircraft);

  const showFlightRouteOnMap = useRadarSettingsStore((state) => state.showFlightRouteOnMap);
  const fitRouteTrigger = useRadarSettingsStore((state) => state.fitRouteTrigger);
  const guiTheme = useRadarSettingsStore((state) => state.guiTheme);
  const customColors = useRadarSettingsStore((state) => state.customColors);

  // Subscribe to route updates
  const [, setTick] = useState(0);
  useEffect(() => {
    return routeService.subscribe(() => setTick((t) => t + 1));
  }, []);

  const selectedAircraft = getSelectedAircraft();
  const flight = selectedAircraft?.flight?.trim();

  // Fetch route if not yet cached
  useEffect(() => {
    if (showFlightRouteOnMap && flight) {
      routeService.fetchRoute(flight);
    }
  }, [showFlightRouteOnMap, flight]);

  const activeColors = guiTheme === 'classic' ? customColors?.classic : customColors?.modern;
  const primaryColor = activeColors?.primary || '#00ff66';
  const secondaryColor = activeColors?.secondary || '#00e5ff';

  const route = flight ? routeService.getCachedRoute(flight) : null;

  // Resolve airport coordinates
  const originCoord = useMemo(() => {
    if (!route) return null;
    return resolveAirportCoordinates(route.originIata, route.originIcao, route.originCoord);
  }, [route]);

  const destCoord = useMemo(() => {
    if (!route) return null;
    return resolveAirportCoordinates(route.destIata, route.destIcao, route.destCoord);
  }, [route]);

  // Handle map fit bounds trigger
  useEffect(() => {
    if (fitRouteTrigger <= 0 || !showFlightRouteOnMap) return;

    const boundsPoints: [number, number][] = [];
    if (originCoord) boundsPoints.push([originCoord.lat, originCoord.lon]);
    if (selectedAircraft && typeof selectedAircraft.lat === 'number' && typeof selectedAircraft.lon === 'number') {
      boundsPoints.push([selectedAircraft.lat, selectedAircraft.lon]);
    }
    if (destCoord) boundsPoints.push([destCoord.lat, destCoord.lon]);

    if (boundsPoints.length >= 2) {
      map.flyToBounds(L.latLngBounds(boundsPoints), {
        padding: [80, 80],
        maxZoom: 11,
        duration: 1,
      });
    }
  }, [fitRouteTrigger, showFlightRouteOnMap, originCoord, destCoord, selectedAircraft, map]);

  // Don't render if toggle is off or no aircraft/route
  if (!showFlightRouteOnMap || !selectedAircraft || !route) {
    return null;
  }

  // Aircraft current position
  const acPos: [number, number] | null =
    typeof selectedAircraft.lat === 'number' && typeof selectedAircraft.lon === 'number'
      ? [selectedAircraft.lat, selectedAircraft.lon]
      : null;

  if (!acPos && !originCoord && !destCoord) {
    return null;
  }

  // Generate intermediate Great Circle points
  const pastPoints: [number, number][] =
    originCoord && acPos
      ? interpolateGreatCirclePoints(originCoord.lat, originCoord.lon, acPos[0], acPos[1], 25)
      : [];

  const futurePoints: [number, number][] =
    acPos && destCoord
      ? interpolateGreatCirclePoints(acPos[0], acPos[1], destCoord.lat, destCoord.lon, 25)
      : [];

  // Direct origin to destination if aircraft position is somehow missing
  const directPoints: [number, number][] =
    !acPos && originCoord && destCoord
      ? interpolateGreatCirclePoints(originCoord.lat, originCoord.lon, destCoord.lat, destCoord.lon, 30)
      : [];

  // Create DivIcons for Origin and Destination airports
  const isClassic = guiTheme === 'classic';

  const makeAirportIcon = (label: string, isDest: boolean) => {
    const color = isDest ? primaryColor : secondaryColor;
    const typeLabel = isDest ? 'ARR' : 'DEP';

    const html = `
      <div style="position: relative; width: 0; height: 0; pointer-events: auto;">
        <!-- Center Beacon Dot exactly on Airport Coordinates -->
        <div style="position: absolute; left: -4px; top: -4px; width: 8px; height: 8px; background: ${color};
                    border: 1.5px solid #000; border-radius: ${isClassic ? '0px' : '50%'}; box-shadow: 0 0 8px ${color};"></div>
        <!-- Floating Label Badge directly above dot -->
        <div style="position: absolute; bottom: 8px; left: 0; transform: translateX(-50%);
                    background: rgba(10, 20, 28, 0.95); border: 1.5px solid ${color}; border-radius: ${isClassic ? '0px' : '4px'};
                    padding: 2px 5px; font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 800;
                    color: ${color}; white-space: nowrap; box-shadow: 0 0 10px ${color}55; display: flex; align-items: center; gap: 3px;">
          <span style="font-size: 8px; opacity: 0.8; border-right: 1px solid ${color}44; padding-right: 3px;">${typeLabel}</span>
          <span>${label}</span>
        </div>
      </div>
    `;

    return L.divIcon({
      className: 'flight-route-airport-marker',
      html,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });
  };

  return (
    <>
      {/* 1. Flown Path (Origin -> Aircraft): Dashed Cyan */}
      {pastPoints.length > 0 && (
        <Polyline
          positions={pastPoints}
          pathOptions={{
            color: secondaryColor,
            weight: 2.2,
            dashArray: '5, 8',
            opacity: 0.75,
            lineCap: 'round',
          }}
          interactive={false}
        />
      )}

      {/* 2. Remaining Path (Aircraft -> Destination): Dashed Green / Bright Cyan */}
      {futurePoints.length > 0 && (
        <Polyline
          positions={futurePoints}
          pathOptions={{
            color: primaryColor,
            weight: 2.5,
            dashArray: '6, 6',
            opacity: 0.95,
            lineCap: 'round',
          }}
          interactive={false}
        />
      )}

      {/* 3. Direct fallback line if aircraft position is not available */}
      {directPoints.length > 0 && (
        <Polyline
          positions={directPoints}
          pathOptions={{
            color: primaryColor,
            weight: 2.5,
            dashArray: '6, 6',
            opacity: 0.85,
            lineCap: 'round',
          }}
          interactive={false}
        />
      )}

      {/* 4. Origin Airport Marker */}
      {originCoord && (
        <Marker
          position={[originCoord.lat, originCoord.lon]}
          icon={makeAirportIcon(originCoord.label, false)}
          interactive={true}
        >
          <Tooltip direction="top" offset={[0, -18]} className="radar-leaflet-tooltip" opacity={0.95}>
            <div className="font-mono text-[11px] leading-tight">
              <div className="text-radar-cyan font-bold">
                DÉPART : {originCoord.label}
              </div>
              <div className="text-white text-[10px]">
                {route.originCity || originCoord.name || originCoord.label}
              </div>
              {route.departureTimeText && (
                <div className="text-radar-muted text-[9px] mt-0.5">
                  {route.departureTimeText} {route.departureStatusText ? `(${route.departureStatusText})` : ''}
                </div>
              )}
            </div>
          </Tooltip>
        </Marker>
      )}

      {/* 5. Destination Airport Marker */}
      {destCoord && (
        <Marker
          position={[destCoord.lat, destCoord.lon]}
          icon={makeAirportIcon(destCoord.label, true)}
          interactive={true}
        >
          <Tooltip direction="top" offset={[0, -18]} className="radar-leaflet-tooltip" opacity={0.95}>
            <div className="font-mono text-[11px] leading-tight">
              <div className="text-radar-green font-bold">
                ARRIVÉE : {destCoord.label}
              </div>
              <div className="text-white text-[10px]">
                {route.destCity || destCoord.name || destCoord.label}
              </div>
              {route.arrivalTimeText && (
                <div className="text-radar-muted text-[9px] mt-0.5">
                  {route.arrivalTimeText} {route.arrivalStatusText ? `(${route.arrivalStatusText})` : ''}
                </div>
              )}
            </div>
          </Tooltip>
        </Marker>
      )}
    </>
  );
};
