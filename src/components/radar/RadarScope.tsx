import React from 'react';
import { MapContainer, Pane } from 'react-leaflet';
import { useAirportStore } from '../../store/useAirportStore';
import { useRadarSettingsStore } from '../../store/useRadarSettingsStore';
import { RadarBackground } from './RadarBackground';
import { RangeRings } from './RangeRings';
import { RunwayCorridor } from './RunwayCorridor';
import { AeronauticalLayer } from './AeronauticalLayer';
import { AircraftLayer } from './AircraftLayer';
import { UserLocationLayer } from './UserLocationLayer';
import { FlightRouteLayer } from './FlightRouteLayer';
import { ConflictAlertLayer } from './ConflictAlertLayer';
import { RulerLayer } from './RulerLayer';
import { MapEventsHandler } from './MapEventsHandler';
import { TagDragHandler } from './TagDragHandler';

export const RadarScope: React.FC = () => {
  const currentAirport = useAirportStore((state) => state.currentAirport);

  // Dynamic layout offsets when sidebars are open
  const sidebarOpen = useRadarSettingsStore((state) => state.sidebarOpen);
  const sidebarWidth = useRadarSettingsStore((state) => state.sidebarWidth);
  const vhfSidebarOpen = useRadarSettingsStore((state) => state.vhfSidebarOpen);
  const vhfSidebarWidth = useRadarSettingsStore((state) => state.vhfSidebarWidth);
  const flightsSidebarOpen = useRadarSettingsStore((state) => state.flightsSidebarOpen);
  const flightsSidebarWidth = useRadarSettingsStore((state) => state.flightsSidebarWidth);
  const detectionRangeNm = useRadarSettingsStore((state) => state.detectionRangeNm);
  const metar = useRadarSettingsStore((state) => state.currentMetar);

  const leftOffset = Math.max(
    vhfSidebarOpen ? vhfSidebarWidth : 0,
    flightsSidebarOpen ? flightsSidebarWidth : 0
  );
  const rightOffset = sidebarOpen ? sidebarWidth : 0;

  if (!currentAirport) {
    return (
      <div className="flex-1 flex items-center justify-center bg-radar-bg text-radar-green">
        INITIALIZING RADAR SCOPE...
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex-1 overflow-hidden bg-radar-bg radar-grid-bg select-none">
      <MapContainer
        center={[currentAirport.lat, currentAirport.lon]}
        zoom={11}
        minZoom={7}
        maxZoom={16}
        zoomControl={false}
        className="w-full h-full"
        style={{ background: 'transparent' }}
      >
        <MapEventsHandler />
        <TagDragHandler />
        <RadarBackground />
        
        {/* Layer 1: Range Rings & Distance / Azimuth Labels (z-index: 350) */}
        <Pane name="rangeRingsPane" style={{ zIndex: 350 }}>
          <RangeRings />
        </Pane>

        {/* Layer 2: Aeronautical Elements - Airspaces, STARS, Waypoints, Navaids, Runways (z-index: 450) */}
        <Pane name="aeroPane" style={{ zIndex: 450 }}>
          <AeronauticalLayer />
          <RunwayCorridor />
        </Pane>

        {/* Layer 3: Flight Routes & Airport Fixes (z-index: 520) */}
        <Pane name="routePane" style={{ zIndex: 520 }}>
          <FlightRouteLayer />
        </Pane>

        {/* Layer 4: User Location (z-index: 550) */}
        <Pane name="userLocationPane" style={{ zIndex: 550 }}>
          <UserLocationLayer />
        </Pane>

        {/* Layer 5: Traffic & Radar Targets - Blips, Tags, Speed Vectors, Breadcrumbs (z-index: 650 - ALWAYS ON TOP of waypoints!) */}
        <Pane name="aircraftPane" style={{ zIndex: 650 }}>
          <AircraftLayer />
        </Pane>

        {/* Layer 6: Conflict Alerts - STCA Vector Lines & Tactical Separation Badge (z-index: 720) */}
        <Pane name="conflictPane" style={{ zIndex: 720 }}>
          <ConflictAlertLayer />
        </Pane>

        {/* Layer 7: Interactive Ruler Measuring Overlay (z-index: 750) */}
        <Pane name="rulerPane" style={{ zIndex: 750 }}>
          <RulerLayer />
        </Pane>
      </MapContainer>

      {/* Scope Corner Grid Reference Labels - dynamically shifted when sidebars expand */}
      <div
        style={{ left: leftOffset > 0 ? `${leftOffset + 14}px` : '12px' }}
        className="absolute top-3 z-[400] pointer-events-none text-[10px] text-radar-muted font-mono opacity-80 transition-all duration-200"
      >
        <div>SYS: STARS / EUROCONTROL MODE S</div>
        <div>SSR RANGE: {detectionRangeNm || 50} NM</div>
      </div>
      <div
        style={{ right: rightOffset > 0 ? `${rightOffset + 14}px` : '12px' }}
        className="absolute top-3 z-[400] pointer-events-none text-[10px] text-radar-muted font-mono opacity-80 text-right transition-all duration-200"
      >
        <div>{metar?.altimHpa ? `QNH: ${metar.altimHpa} HPA` : 'QNH: 1013 HPA'}</div>
        <div>TL: FL050</div>
      </div>
    </div>
  );
};
