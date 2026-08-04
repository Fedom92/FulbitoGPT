import { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import './AppModal.css';

const MAX_NAME_LENGTH = 20;

function AuthorNameModal({ show, onClose, onConfirm }) {
  const [name, setName] = useState('');

  const handleConfirm = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onConfirm(trimmed);
    setName('');
  };

  const handleExited = () => setName('');

  return (
    <Modal show={show} onHide={onClose} onExited={handleExited} contentClassName="app-modal">
      <div className="app-modal__handle" />
      <Modal.Header closeButton>
        <div className="app-modal__header-content">
          <div className="app-modal__icon app-modal__icon--orange">💾</div>
          <div>
            <Modal.Title className="app-modal__title">Guardar formación</Modal.Title>
            <p className="app-modal__subtitle">Antes de guardar, ponele un nombre.</p>
          </div>
        </div>
      </Modal.Header>
      <Modal.Body>
        <Form.Group controlId="authorName">
          <div className="app-input-group">
            <span className="app-input-group__icon">✍️</span>
            <Form.Control
              type="text"
              maxLength={MAX_NAME_LENGTH}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirm();
              }}
              placeholder="..."
            />
          </div>
          <div className="app-field-row">
            <span className="app-field-hint">Se mostrará al ingresar a la formación.</span>
            <span className="app-field-counter">
              {name.length}/{MAX_NAME_LENGTH}
            </span>
          </div>
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="app-btn app-btn--primary" disabled={!name.trim()} onClick={handleConfirm}>
          ✓ Guardar
        </button>
        <button type="button" className="app-btn app-btn--secondary" onClick={onClose}>
          Cancelar
        </button>
      </Modal.Footer>
    </Modal>
  );
}

export default AuthorNameModal;
