import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { useRadarSettingsStore } from '../../store/useRadarSettingsStore';
import { useTrafficStore } from '../../store/useTrafficStore';

export const TagDragHandler: React.FC = () => {
  const map = useMap();
  const setTagOffset = useRadarSettingsStore((state) => state.setTagOffset);
  const resetTagOffset = useRadarSettingsStore((state) => state.resetTagOffset);
  const tagOffsets = useRadarSettingsStore((state) => state.tagOffsets);
  const selectAircraft = useTrafficStore((state) => state.selectAircraft);

  useEffect(() => {
    const container = map.getContainer();

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const dragEl = target.closest('[data-drag-hex]') as HTMLElement | null;
      if (!dragEl) return;

      const hex = dragEl.getAttribute('data-drag-hex');
      if (!hex) return;

      // Disable Leaflet map dragging while moving an ATC tag
      map.dragging.disable();
      e.stopPropagation();

      const startX = e.clientX;
      const startY = e.clientY;
      const initialOffset = tagOffsets[hex] || { x: 38, y: -38 };
      let hasMoved = false;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;

        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
          hasMoved = true;
        }

        setTagOffset(hex, {
          x: Math.round(initialOffset.x + dx),
          y: Math.round(initialOffset.y + dy),
        });
      };

      const handleMouseUp = (upEvent: MouseEvent) => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        map.dragging.enable();

        // If it was just a click (no drag), select the aircraft
        if (!hasMoved) {
          selectAircraft(hex);
        }
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    };

    // Double-click to reset tag to default position
    const handleDblClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const dragEl = target.closest('[data-drag-hex]') as HTMLElement | null;
      if (!dragEl) return;

      const hex = dragEl.getAttribute('data-drag-hex');
      if (hex) {
        resetTagOffset(hex);
        e.stopPropagation();
      }
    };

    container.addEventListener('mousedown', handleMouseDown, true);
    container.addEventListener('dblclick', handleDblClick, true);

    return () => {
      container.removeEventListener('mousedown', handleMouseDown, true);
      container.removeEventListener('dblclick', handleDblClick, true);
    };
  }, [map, tagOffsets, setTagOffset, resetTagOffset, selectAircraft]);

  return null;
};
