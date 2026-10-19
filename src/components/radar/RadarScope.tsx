import React from 'react';
import { MapContainer } from 'react-leaflet';
import { useAirportStore } from '../../store/useAirportStore';
import { RadarBackground } from './RadarBackground';
import { RangeRings } from './RangeRings';
import { RunwayCorridor } from './RunwayCorridor';
import { AeronauticalLayer } from './AeronauticalLayer';
import { AircraftLayer } from './AircraftLayer';
import { UserLocationLayer } from './UserLocationLayer';
import { MapEventsHandler } from './MapEventsHandler';
import { TagDragHandler } from './TagDragHandler';

export const RadarScope: React.FC = () => {
  const currentAirport = useAirportStore((state) => state.currentAirport);

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
        <RangeRings />
        <AeronauticalLayer />
        <RunwayCorridor />
        <UserLocationLayer />
        <AircraftLayer />
      </MapContainer>

      {/* Scope Corner Grid Reference Labels */}
      <div className="absolute top-3 left-3 z-[400] pointer-events-none text-[10px] text-radar-muted font-mono opacity-80">
        <div>SYS: STARS / EUROCONTROL MODE S</div>
        <div>SSR RANGE: 50 NM</div>
      </div>
      <div className="absolute top-3 right-3 z-[400] pointer-events-none text-[10px] text-radar-muted font-mono opacity-80 text-right">
        <div>QNH: 1013 HPA</div>
        <div>TL: FL050</div>
      </div>
    </div>
  );
};
