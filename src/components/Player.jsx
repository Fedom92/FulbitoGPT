import { usePlayerDrag } from '../hooks/usePlayerDrag.js';
import './Player.css';

function fontSizeFor(name) {
  if (name.length <= 4) return 14;
  if (name.length <= 7) return 12;
  return 10;
}

function Player({ player, fieldRef, onMove, onDelete, onRequestDelete, onLongPressStart, onLongPressEnd }) {
  const { phase, handlers } = usePlayerDrag({
    id: player.id,
    fieldRef,
    onMove,
    onDelete,
    onRequestDelete,
    onLongPressStart,
    onLongPressEnd,
  });

  const isMoving = phase === 'dragging' || phase === 'armed';
  const team = player.team === 'red' ? 'red' : 'blue';

  return (
    <div
      className={`player player--${team}${isMoving ? ' player--moving' : ''}${phase === 'armed' ? ' player--armed' : ''}`}
      style={{ left: `${player.x}%`, top: `${player.y}%`, fontSize: `${fontSizeFor(player.name)}px` }}
      {...handlers}
    >
      {player.name}
    </div>
  );
}

export default Player;
