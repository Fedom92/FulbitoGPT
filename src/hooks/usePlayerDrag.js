import { useRef, useState } from 'react';
import { clamp } from '../utils/clamp.js';
import { DELETE_ZONE_HEIGHT_PX } from '../components/DeleteZone.jsx';

const LONG_PRESS_MS = 500;
const MOVE_THRESHOLD_PX = 8;
const DOUBLE_CLICK_MS = 400;

// Touch: long-press arms delete mode (shows the ELIMINAR strip), then drop the
// player on it to delete immediately — real fingers rarely stay still enough
// for a reliable double-tap, so touch never uses the double-click path.
// Mouse/pen: double-click asks for confirmation instead (onRequestDelete).
export function usePlayerDrag({ id, fieldRef, onMove, onDelete, onRequestDelete, onLongPressStart, onLongPressEnd }) {
  const [phase, setPhase] = useState('idle'); // idle | dragging | armed
  const phaseRef = useRef('idle');
  const pointerTypeRef = useRef('mouse');
  const timerRef = useRef(null);
  const startRef = useRef({ x: 0, y: 0 });
  const rectRef = useRef(null);
  const lastClickRef = useRef(0);

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
    setPhaseBoth('idle');

    clearTimer();
    if (pointerTypeRef.current === 'touch') {
      timerRef.current = setTimeout(() => {
        setPhaseBoth('armed');
        onLongPressStart?.(id);
        navigator.vibrate?.(30);
      }, LONG_PRESS_MS);
    }
  };

  const handlePointerMove = (event) => {
    if (!rectRef.current) return;

    if (phaseRef.current === 'idle') {
      const dx = event.clientX - startRef.current.x;
      const dy = event.clientY - startRef.current.y;
      if (Math.hypot(dx, dy) > MOVE_THRESHOLD_PX) {
        clearTimer();
        setPhaseBoth('dragging');
      } else {
        return;
      }
    }

    const pos = computePercent(event.clientX, event.clientY);
    if (pos) onMove(id, pos.x, pos.y);
  };

  const finishGesture = (event) => {
    clearTimer();
    const finishedPhase = phaseRef.current;

    if (finishedPhase === 'armed') {
      const inDeleteZone = event.clientY >= window.innerHeight - DELETE_ZONE_HEIGHT_PX;
      if (inDeleteZone) {
        onDelete?.(id);
      } else {
        const pos = computePercent(event.clientX, event.clientY);
        if (pos) onMove(id, pos.x, pos.y);
      }
      onLongPressEnd?.();
    } else if (finishedPhase === 'idle' && pointerTypeRef.current !== 'touch') {
      // A plain click (no movement) on mouse/pen: check for double-click.
      const now = Date.now();
      if (now - lastClickRef.current < DOUBLE_CLICK_MS) {
        lastClickRef.current = 0;
        onRequestDelete?.(id);
      } else {
        lastClickRef.current = now;
      }
    }

    setPhaseBoth('idle');
    rectRef.current = null;
  };

  return {
    phase,
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: finishGesture,
      onPointerCancel: finishGesture,
    },
  };
}
