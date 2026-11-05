import { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { MAX_PLAYER_NAME_LENGTH } from '../utils/formation.js';
import './AppModal.css';

function EditPlayerModal({ player, onSave, onClose }) {
  const [name, setName] = useState('');

  useEffect(() => {
    if (player) setName(player.name);
  }, [player]);

  const trimmed = name.trim();
  const canSave = trimmed.length > 0;

  const handleSave = () => {
    if (!canSave) return;
    onSave(player.id, trimmed);
  };

  return (
    <Modal show={player != null} onHide={onClose} contentClassName="app-modal">
      <div className="app-modal__handle" />
      <Modal.Header closeButton>
        <div className="app-modal__header-content">
          <div className="app-modal__icon app-modal__icon--orange">✏️</div>
          <Modal.Title className="app-modal__title">Editar jugador</Modal.Title>
        </div>
      </Modal.Header>
      <Modal.Body className="pb-4">
        <Form.Group controlId="editPlayerName">
          <div className="app-inline-row">
            <div className="app-input-group">
              <span className="app-input-group__icon">👤</span>
              <Form.Control
                type="text"
                maxLength={MAX_PLAYER_NAME_LENGTH}
                value={name}
                autoFocus
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave();
                }}
              />
            </div>
            <button
              type="button"
              className="app-icon-btn"
              disabled={!canSave}
              onClick={handleSave}
              aria-label="Guardar nombre"
            >
              💾
            </button>
          </div>
        </Form.Group>
      </Modal.Body>
    </Modal>
  );
}

export default EditPlayerModal;
