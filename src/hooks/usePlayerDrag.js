import { useRef, useState } from 'react';
import { clamp } from '../utils/clamp.js';

const LONG_PRESS_MS = 500;
const MOVE_THRESHOLD_PX = 8;
const DOUBLE_TAP_MS = 400;
// The delete zone covers the space between the bottom of the pitch and the
// bottom of the screen, but never less than this, so it stays easy to hit.
const MIN_DELETE_ZONE_PX = 48;

export function deleteZoneTop(fieldRect) {
  return Math.min(fieldRect.bottom, window.innerHeight - MIN_DELETE_ZONE_PX);
}

// Gestures on a player (mouse, touch and pen alike):
// - drag: moves it; while dragging, the ELIMINAR zone shows up under the pitch
//   and dropping the player there deletes it.
// - long-press (touch): highlights the player and shows the zone right away,
//   before moving.
// - double click / double tap: asks to rename it (onDoubleTap).
export function usePlayerDrag({ id, fieldRef, onMove, onDelete, onDoubleTap, onDragStart, onZoneHover, onDragEnd }) {
  const [phase, setPhase] = useState('idle'); // idle | dragging | armed
  const phaseRef = useRef('idle');
  const pointerTypeRef = useRef('mouse');
  const timerRef = useRef(null);
  const startRef = useRef({ x: 0, y: 0 });
  const rectRef = useRef(null);
  const zoneTopRef = useRef(Infinity);
  const overZoneRef = useRef(false);
  const lastTapRef = useRef(0);

  const setPhaseBoth = (next) => {
    phaseRef.current = next;
    setPhase(next);
  };

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const computePercent = (clientX, clientY) => {
    const rect = rectRef.current;
    if (!rect) return null;
    return {
      x: clamp(((clientX - rect.left) / rect.width) * 100, 0, 100),
      y: clamp(((clientY - rect.top) / rect.height) * 100, 0, 100),
    };
  };

  const startMoving = (nextPhase) => {
    setPhaseBoth(nextPhase);
    onDragStart?.(window.innerHeight - zoneTopRef.current);
  };

  const updateZoneHover = (clientY) => {
    const over = clientY >= zoneTopRef.current;
    if (over !== overZoneRef.current) {
      overZoneRef.current = over;
      onZoneHover?.(over);
    }
  };

  const handlePointerDown = (event) => {
    event.preventDefault();
    try {
      event.target.setPointerCapture(event.pointerId);
    } catch {
      // Ignore: capture is a nice-to-have, not required for the drag math below.
    }
    pointerTypeRef.current = event.pointerType || 'mouse';
    startRef.current = { x: event.clientX, y: event.clientY };
    rectRef.current = fieldRef.current?.getBoundingClientRect() ?? null;
    zoneTopRef.current = rectRef.current ? deleteZoneTop(rectRef.current) : Infinity;
    overZoneRef.current = false;
    setPhaseBoth('idle');

    clearTimer();
    if (pointerTypeRef.current === 'touch') {
      timerRef.current = setTimeout(() => {
        startMoving('armed');
        navigator.vibrate?.(30);
      }, LONG_PRESS_MS);
    }
  };

  const handlePointerMove = (event) => {
    if (!rectRef.current) return;

    if (phaseRef.current === 'idle') {
      const dx = event.clientX - startRef.current.x;
      const dy = event.clientY - startRef.current.y;
      if (Math.hypot(dx, dy) <= MOVE_THRESHOLD_PX) return;
      clearTimer();
      startMoving('dragging');
    }

    updateZoneHover(event.clientY);
    const pos = computePercent(event.clientX, event.clientY);
    if (pos) onMove(id, pos.x, pos.y);
  };

  const finish = (event, cancelled) => {
    clearTimer();
    const finishedPhase = phaseRef.current;

    if (finishedPhase === 'dragging' || finishedPhase === 'armed') {
      if (!cancelled && event.clientY >= zoneTopRef.current) {
        onDelete?.(id);
      }
      onDragEnd?.();
    } else if (!cancelled) {
      // A tap/click without movement: two in a row ask to rename.
      const now = Date.now();
      if (now - lastTapRef.current < DOUBLE_TAP_MS) {
        lastTapRef.current = 0;
        onDoubleTap?.(id);
      } else {
        lastTapRef.current = now;
      }
    }

    overZoneRef.current = false;
    setPhaseBoth('idle');
    rectRef.current = null;
  };

  return {
    phase,
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: (event) => finish(event, false),
      onPointerCancel: (event) => finish(event, true),
    },
  };
}
