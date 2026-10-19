import React from 'react';
import { TileLayer } from 'react-leaflet';
import { useRadarSettingsStore } from '../../store/useRadarSettingsStore';

export const RadarBackground: React.FC = () => {
  const mapMode = useRadarSettingsStore((state) => state.mapMode);
  const openAipApiKey = useRadarSettingsStore((state) => state.openAipApiKey);

  if (mapMode === 'pure') {
    return null;
  }

  return (
    <>
      {/* Mode 1: OpenStreetMap Dark/Inverted */}
      {mapMode === 'osm-dark' && (
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          className="map-osm-dark"
          opacity={0.35}
          maxZoom={19}
        />
      )}

      {/* Mode 2: OpenAIP Aeronautical Chart with OpenStreetMap Dark Basemap */}
      {mapMode === 'openaip' && (
        <>
          <TileLayer
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            className="map-osm-dark"
            opacity={0.25}
            maxZoom={19}
          />
          <TileLayer
            url={
              openAipApiKey
                ? `https://api.tiles.openaip.net/api/data/openaip/{z}/{x}/{y}.png?apiKey=${openAipApiKey}`
                : 'https://api.tiles.openaip.net/api/data/openaip/{z}/{x}/{y}.png'
            }
            attribution='Map data &copy; <a href="https://www.openaip.net/">OpenAIP</a>'
            className="map-openaip"
            opacity={0.8}
            maxZoom={14}
            minZoom={4}
          />
        </>
      )}
    </>
  );
};
