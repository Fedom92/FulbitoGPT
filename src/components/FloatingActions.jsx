import './FloatingActions.css';

function FloatingActions({ onAdd, onShuffle, canAdd, showShuffle, canShuffle }) {
  return (
    <div className="fab-group">
      {showShuffle && (
        <button
          type="button"
          className="fab fab--secondary"
          onClick={onShuffle}
          disabled={!canShuffle}
          aria-label="Sortear equipos"
        >
          🎲
        </button>
      )}
      <button
        type="button"
        className="fab fab--primary"
        onClick={onAdd}
        disabled={!canAdd}
        aria-label="Agregar jugador"
      >
        +
      </button>
    </div>
  );
}

export default FloatingActions;
