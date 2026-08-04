import './AddPlayerButton.css';

function AddPlayerButton({ onClick }) {
  return (
    <button type="button" className="add-player-btn" onClick={onClick} aria-label="Agregar jugador">
      +
    </button>
  );
}

export default AddPlayerButton;
