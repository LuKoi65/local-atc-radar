import React, { useEffect } from 'react';
import { Marker, Circle, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { useRadarSettingsStore } from '../../store/useRadarSettingsStore';
import { useAirportStore } from '../../store/useAirportStore';
import { haversineDistanceNm, calculateBearing } from '../../utils/aviationMath';

export const UserLocationLayer: React.FC = () => {
  const showUserLocation = useRadarSettingsStore((state) => state.showUserLocation);
  const userLocation = useRadarSettingsStore((state) => state.userLocation);
  const setUserLocation = useRadarSettingsStore((state) => state.setUserLocation);
  const currentAirport = useAirportStore((state) => state.currentAirport);
  const getActiveRunwayEnd = useAirportStore((state) => state.getActiveRunwayEnd);

  // Toggle tag display on click only (uncluttered by default)
  const [isTagVisible, setIsTagVisible] = React.useState(false);

  // Watch position when feature is enabled
  useEffect(() => {
    if (!showUserLocation || !navigator.geolocation) {
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          accuracyMeters: pos.coords.accuracy,
        });
      },
      (err) => {
        console.warn('[GPS] Geolocation error or permission denied:', err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [showUserLocation, setUserLocation]);

  if (!showUserLocation || !userLocation) {
    return null;
  }

  const activeRunwayEnd = getActiveRunwayEnd();
  const origin = activeRunwayEnd?.threshold || { lat: currentAirport.lat, lon: currentAirport.lon };

  const distToOriginNm = haversineDistanceNm(
    origin.lat,
    origin.lon,
    userLocation.lat,
    userLocation.lon
  );
  const bearingFromOrigin = calculateBearing(
    origin.lat,
    origin.lon,
    userLocation.lat,
    userLocation.lon
  );

  // Custom GPS Station Icon
  const iconHtml = `
    <div class="relative pointer-events-auto select-none" style="width: 0; height: 0; cursor: pointer;" title="Position GPS Station (Cliquer pour ${isTagVisible ? 'masquer' : 'afficher'} les détails)">
      <!-- Glowing Blue Crosshair Target -->
      <div style="position: absolute; left: -14px; top: -14px; width: 28px; height: 28px;">
        <!-- Pulsing Center Circle -->
        <div style="position: absolute; left: 10px; top: 10px; width: 8px; height: 8px; background: #00e5ff; border: 1.5px solid #ffffff; border-radius: 50%; box-shadow: 0 0 12px #00e5ff;"></div>
        <!-- Crosshair lines -->
        <div style="position: absolute; left: 13px; top: 0; width: 2px; height: 7px; background: #00e5ff;"></div>
        <div style="position: absolute; left: 13px; bottom: 0; width: 2px; height: 7px; background: #00e5ff;"></div>
        <div style="position: absolute; top: 13px; left: 0; height: 2px; width: 7px; background: #00e5ff;"></div>
        <div style="position: absolute; top: 13px; right: 0; height: 2px; width: 7px; background: #00e5ff;"></div>
        <!-- Pulsing radar ring -->
        <div class="animate-ping" style="position: absolute; left: 4px; top: 4px; width: 20px; height: 20px; border: 1.5px solid #00e5ff; border-radius: 50%; opacity: 0.5;"></div>
      </div>

      ${
        isTagVisible
          ? `
        <!-- Station Data Tag (Shown only when clicked) -->
        <div style="position: absolute; left: 24px; top: -24px; background: rgba(10, 25, 35, 0.98); border: 1.5px solid #00e5ff;
                    border-radius: 3px; padding: 4px 8px; font-family: 'JetBrains Mono', monospace; font-size: 10px;
                    color: #00e5ff; box-shadow: 0 6px 20px rgba(0,0,0,0.95); min-width: 150px; z-index: 1000;">
          <div style="display: flex; justify-content: space-between; align-items: center; font-weight: 800; border-bottom: 1px solid rgba(0,229,255,0.3); padding-bottom: 2px;">
            <span>📍 MA POSITION</span>
            <span style="font-size: 9px; background: #00e5ff; color: #0a0f14; padding: 0 4px; border-radius: 2px; font-weight: 900;">GPS FIX</span>
          </div>
          <div style="color: #ffffff; font-weight: 700; margin-top: 3px;">
            ${distToOriginNm.toFixed(1)} NM de ${currentAirport.icao} (${bearingFromOrigin.toFixed(0)}°)
          </div>
          <div style="font-size: 9px; opacity: 0.85; margin-top: 2px; color: #a0c4c0;">
            ${userLocation.lat.toFixed(4)}°, ${userLocation.lon.toFixed(4)}°
            ${userLocation.accuracyMeters ? `(±${Math.round(userLocation.accuracyMeters)}m)` : ''}
          </div>
        </div>

        <!-- Tag Leader Line -->
        <svg style="position: absolute; left: 0; top: 0; width: 1px; height: 1px; overflow: visible; pointer-events: none;">
          <line x1="0" y1="0" x2="24" y2="-12" stroke="#00e5ff" stroke-width="1.2" stroke-dasharray="2,2" opacity="0.85" />
        </svg>
        `
          : ''
      }
    </div>
  `;

  const customIcon = L.divIcon({
    className: 'user-gps-station-marker',
    html: iconHtml,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });

  return (
    <>
      {/* Accuracy radius circle if available */}
      {userLocation.accuracyMeters && userLocation.accuracyMeters < 5000 && (
        <Circle
          center={[userLocation.lat, userLocation.lon]}
          radius={userLocation.accuracyMeters}
          pathOptions={{
            color: '#00e5ff',
            weight: 1,
            dashArray: '3, 4',
            fillColor: '#00e5ff',
            fillOpacity: 0.08,
          }}
          interactive={false}
        />
      )}

      {/* Vector Line connecting User to Airport */}
      {isTagVisible && (
        <Polyline
          positions={[
            [origin.lat, origin.lon],
            [userLocation.lat, userLocation.lon],
          ]}
          pathOptions={{
            color: '#00e5ff',
            weight: 1,
            dashArray: '4, 4',
            opacity: 0.5,
          }}
        />
      )}

      {/* GPS Marker */}
      <Marker
        position={[userLocation.lat, userLocation.lon]}
        icon={customIcon}
        interactive={true}
        eventHandlers={{
          click: () => setIsTagVisible((prev) => !prev),
        }}
      />
    </>
  );
};
