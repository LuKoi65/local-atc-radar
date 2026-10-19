import React, { useMemo } from 'react';
import { Circle, Polyline, Marker } from 'react-leaflet';
import L from 'leaflet';
import { useAirportStore } from '../../store/useAirportStore';
import { useRadarSettingsStore } from '../../store/useRadarSettingsStore';
import { destinationPoint, NM_TO_METERS } from '../../utils/aviationMath';

export const RangeRings: React.FC = () => {
  const currentAirport = useAirportStore((state) => state.currentAirport);
  const showRangeRings = useRadarSettingsStore((state) => state.showRangeRings);
  const ringDistances = useRadarSettingsStore((state) => state.rangeRingDistances);

  // Compute Azimuth Radial Ticks (every 30 degrees)
  const azimuthData = useMemo(() => {
    if (!currentAirport) return [];
    const ticks: {
      bearing: number;
      line: [number, number][];
      labelPos: [number, number];
      label: string;
    }[] = [];

    const maxDistNm = Math.max(...ringDistances, 30);

    for (let deg = 0; deg < 360; deg += 30) {
      // Small tick across the outermost ring (from maxDistNm - 1.2 to maxDistNm + 1.2)
      const p1 = destinationPoint(currentAirport.lat, currentAirport.lon, deg, maxDistNm - 1.2);
      const p2 = destinationPoint(currentAirport.lat, currentAirport.lon, deg, maxDistNm + 1.2);
      const pLabel = destinationPoint(currentAirport.lat, currentAirport.lon, deg, maxDistNm + 2.5);

      ticks.push({
        bearing: deg,
        line: [
          [p1.lat, p1.lon],
          [p2.lat, p2.lon],
        ],
        labelPos: [pLabel.lat, pLabel.lon],
        label: deg.toString().padStart(3, '0'),
      });
    }

    return ticks;
  }, [currentAirport, ringDistances]);

  // Cardinal crosshair lines through the center (N-S and E-W faint reference lines)
  const crosshairLines = useMemo(() => {
    if (!currentAirport) return [];
    const maxDistNm = Math.max(...ringDistances, 30);
    const n = destinationPoint(currentAirport.lat, currentAirport.lon, 0, maxDistNm);
    const s = destinationPoint(currentAirport.lat, currentAirport.lon, 180, maxDistNm);
    const e = destinationPoint(currentAirport.lat, currentAirport.lon, 90, maxDistNm);
    const w = destinationPoint(currentAirport.lat, currentAirport.lon, 270, maxDistNm);

    return [
      [[s.lat, s.lon], [n.lat, n.lon]] as [number, number][],
      [[w.lat, w.lon], [e.lat, e.lon]] as [number, number][],
    ];
  }, [currentAirport, ringDistances]);

  if (!showRangeRings || !currentAirport) return null;

  return (
    <>
      {/* Cardinal crosshairs */}
      {crosshairLines.map((line, idx) => (
        <Polyline
          key={`crosshair-${idx}`}
          positions={line}
          pathOptions={{
            color: '#00ff66',
            weight: 1,
            opacity: 0.12,
            dashArray: '3, 6',
          }}
        />
      ))}

      {/* Concentric Range Rings */}
      {ringDistances.map((distNm) => {
        const radiusMeters = distNm * NM_TO_METERS;
        const isMajor = distNm === 10 || distNm === 20 || distNm === 30;

        // Label position along 045° radial
        const labelCoord = destinationPoint(currentAirport.lat, currentAirport.lon, 45, distNm);

        const labelIcon = L.divIcon({
          className: 'custom-radar-label',
          html: `<div style="color: #00bb4a; font-size: 11px; font-weight: bold; background: rgba(10,15,20,0.85); padding: 1px 3px; border: 1px solid rgba(0,255,102,0.3); border-radius: 2px; white-space: nowrap; transform: translate(-50%, -50%);">${distNm} NM</div>`,
          iconSize: [40, 16],
          iconAnchor: [20, 8],
        });

        return (
          <React.Fragment key={`ring-${distNm}`}>
            <Circle
              center={[currentAirport.lat, currentAirport.lon]}
              radius={radiusMeters}
              pathOptions={{
                color: isMajor ? '#00ff66' : '#00bb4a',
                weight: isMajor ? 1.2 : 0.8,
                opacity: isMajor ? 0.35 : 0.2,
                fill: false,
                dashArray: isMajor ? undefined : '4, 8',
              }}
            />
            <Marker position={[labelCoord.lat, labelCoord.lon]} icon={labelIcon} interactive={false} />
          </React.Fragment>
        );
      })}

      {/* Azimuth Ticks & Degree Labels */}
      {azimuthData.map((tick) => {
        const degreeIcon = L.divIcon({
          className: 'custom-azimuth-label',
          html: `<div style="color: #00e5ff; font-size: 10px; font-family: monospace; opacity: 0.65; white-space: nowrap; transform: translate(-50%, -50%);">${tick.label}°</div>`,
          iconSize: [28, 14],
          iconAnchor: [14, 7],
        });

        return (
          <React.Fragment key={`azimuth-${tick.bearing}`}>
            <Polyline
              positions={tick.line}
              pathOptions={{
                color: '#00e5ff',
                weight: 1.2,
                opacity: 0.45,
              }}
            />
            <Marker position={tick.labelPos} icon={degreeIcon} interactive={false} />
          </React.Fragment>
        );
      })}
    </>
  );
};
