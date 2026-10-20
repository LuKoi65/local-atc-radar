import React, { useEffect, useMemo, useRef } from 'react';
import { Polyline, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useTrafficStore } from '../../store/useTrafficStore';
import { useRadarSettingsStore } from '../../store/useRadarSettingsStore';
import { useAlertLogStore } from '../../store/useAlertLogStore';
import { detectStcaConflicts, StcaConflict } from '../../services/radar/stcaService';
import { playStcaAlertSound } from '../../utils/audioAlert';

export const ConflictAlertLayer: React.FC = () => {
  const map = useMap();
  const aircraftList = useTrafficStore((state) => state.aircraftList);
  const stcaEnabled = useRadarSettingsStore((state) => state.stcaEnabled);
  const stcaAudioEnabled = useRadarSettingsStore((state) => state.stcaAudioEnabled);
  const mutedConflictIds = useRadarSettingsStore((state) => state.mutedConflictIds);
  const muteConflict = useRadarSettingsStore((state) => state.muteConflict);
  const guiTheme = useRadarSettingsStore((state) => state.guiTheme);
  const addAlertLog = useAlertLogStore((state) => state.addEntry);

  const prevConflictIdsRef = useRef<Set<string>>(new Set());

  // Run conflict detection on active traffic with manual muted filter
  const { conflicts } = useMemo(() => {
    if (!stcaEnabled || aircraftList.length < 2) {
      return { conflicts: [], conflictHexMap: new Map() };
    }
    return detectStcaConflicts(aircraftList, mutedConflictIds);
  }, [aircraftList, stcaEnabled, mutedConflictIds]);

  // Listen for clicks on the [✕] dismiss button inside the midpoint tactical badge
  useEffect(() => {
    const container = map.getContainer();
    const handleMuteClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const muteBtn = target.closest('[data-mute-conflict]') as HTMLElement | null;
      if (muteBtn) {
        const conflictId = muteBtn.getAttribute('data-mute-conflict');
        if (conflictId) {
          e.stopPropagation();
          e.preventDefault();
          muteConflict(conflictId);
        }
      }
    };
    container.addEventListener('click', handleMuteClick, true);
    return () => {
      container.removeEventListener('click', handleMuteClick, true);
    };
  }, [map, muteConflict]);

  // Handle audio alert and event log registration (only for unmuted active conflicts)
  useEffect(() => {
    const activeUnmuted = conflicts.filter((c) => !c.isMuted);
    if (!stcaEnabled || activeUnmuted.length === 0) {
      prevConflictIdsRef.current.clear();
      return;
    }

    const currentIds = new Set(activeUnmuted.map((c) => c.id));
    let hasNewConflict = false;
    let highestLevel: 'caution' | 'warning' = 'caution';

    for (const conflict of activeUnmuted) {
      if (conflict.level === 'warning') highestLevel = 'warning';

      if (!prevConflictIdsRef.current.has(conflict.id)) {
        hasNewConflict = true;
        // Log to alert history store
        addAlertLog({
          type: conflict.level === 'warning' ? 'STCA_WARNING' : 'STCA_CAUTION',
          severity: conflict.level === 'warning' ? 'warning' : 'caution',
          title:
            conflict.level === 'warning'
              ? `ALERTE STCA : ${conflict.ac1.flight} ↔ ${conflict.ac2.flight}`
              : `PROXIMITÉ : ${conflict.ac1.flight} ↔ ${conflict.ac2.flight}`,
          details: `Séparation: ${conflict.currentDistNm.toFixed(1)} NM / ${conflict.currentAltDiffFt} FT vert. ${
            conflict.timeToCpaMin ? `(CPA: ${conflict.distAtCpaNm?.toFixed(1)} NM dans ${Math.round(conflict.timeToCpaMin * 60)}s)` : ''
          }`,
          callsign1: conflict.ac1.flight,
          hex1: conflict.ac1.hex,
          callsign2: conflict.ac2.flight,
          hex2: conflict.ac2.hex,
        });
      }
    }

    // Play discrete audio tone if enabled and not muted
    if (stcaAudioEnabled && (hasNewConflict || highestLevel === 'warning')) {
      playStcaAlertSound(highestLevel);
    }

    prevConflictIdsRef.current = currentIds;
  }, [conflicts, stcaEnabled, stcaAudioEnabled, addAlertLog]);

  const activeConflicts = conflicts.filter((c) => !c.isMuted);

  if (!stcaEnabled || activeConflicts.length === 0) {
    return null;
  }

  const isClassic = guiTheme === 'classic';

  const makeMidpointBadge = (conflict: StcaConflict) => {
    const isWarning = conflict.level === 'warning';
    const color = isWarning ? '#ff2244' : '#ffaa00';
    const label = isWarning ? 'STCA' : 'PROX';

    const html = `
      <div style="position: relative; width: 0; height: 0; pointer-events: auto;">
        <div style="position: absolute; transform: translate(-50%, -50%);
                    background: rgba(20, 5, 8, 0.95); border: 1.5px solid ${color};
                    border-radius: ${isClassic ? '0px' : '3px'}; padding: 2px 6px;
                    font-family: 'JetBrains Mono', Consolas, monospace; font-size: 9.5px; font-weight: 800;
                    color: ${color}; white-space: nowrap; box-shadow: 0 0 12px ${color}88;
                    display: flex; align-items: center; gap: 4px; pointer-events: auto;"
             class="${isWarning ? 'stca-warning-strobe' : ''}">
          <span style="background: ${color}; color: #0a0a0a; padding: 0 3px; border-radius: 1px; font-size: 8.5px; font-weight: 900;">
            ${label}
          </span>
          <span>${conflict.currentDistNm.toFixed(1)} NM</span>
          <span style="opacity: 0.8; font-size: 8.5px;">/ ${conflict.currentAltDiffFt} FT</span>
          <button data-mute-conflict="${conflict.id}"
                  style="background: rgba(0,0,0,0.5); border: 1px solid ${color}aa; border-radius: 2px;
                         color: #ffffff; font-size: 9px; line-height: 1; padding: 1px 4px; margin-left: 2px; cursor: pointer;"
                  title="Désactiver / Acquitter cette alerte (Situation sous contrôle)">
            ✕
          </button>
        </div>
      </div>
    `;

    return L.divIcon({
      className: 'stca-midpoint-marker',
      html,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });
  };

  return (
    <>
      {activeConflicts.map((conflict) => {
        const isWarning = conflict.level === 'warning';
        const color = isWarning ? '#ff2244' : '#ffaa00';
        const midLat = (conflict.ac1.lat + conflict.ac2.lat) / 2;
        const midLon = (conflict.ac1.lon + conflict.ac2.lon) / 2;

        return (
          <React.Fragment key={`conflict-${conflict.id}`}>
            {/* Interconnecting dashed alert line between the two aircraft */}
            <Polyline
              positions={[
                [conflict.ac1.lat, conflict.ac1.lon],
                [conflict.ac2.lat, conflict.ac2.lon],
              ]}
              pathOptions={{
                color,
                weight: isWarning ? 2.5 : 2,
                dashArray: '6, 6',
                opacity: 0.95,
              }}
              interactive={false}
            />

            {/* Midpoint separation badge with manual dismissal [✕] */}
            <Marker
              position={[midLat, midLon]}
              icon={makeMidpointBadge(conflict)}
              interactive={true}
              zIndexOffset={12000}
            />
          </React.Fragment>
        );
      })}
    </>
  );
};
