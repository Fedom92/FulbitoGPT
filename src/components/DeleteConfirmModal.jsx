import Modal from 'react-bootstrap/Modal';
import './AppModal.css';

function DeleteConfirmModal({ player, onConfirm, onCancel }) {
  return (
    <Modal show={player != null} onHide={onCancel} contentClassName="app-modal">
      <div className="app-modal__handle" />
      <Modal.Header closeButton>
        <div className="app-modal__header-content">
          <div className="app-modal__icon app-modal__icon--red">🗑️</div>
          <div>
            <Modal.Title className="app-modal__title">¿Eliminar a {player?.name}?</Modal.Title>
            <p className="app-modal__subtitle">Esta acción no se puede deshacer...</p>
          </div>
        </div>
      </Modal.Header>
      <Modal.Footer>
        <button type="button" className="app-btn app-btn--secondary" onClick={onCancel}>
          Cancelar
        </button>
        <button type="button" className="app-btn app-btn--danger" onClick={onConfirm}>
          Eliminar
        </button>
      </Modal.Footer>
    </Modal>
  );
}

export default DeleteConfirmModal;
