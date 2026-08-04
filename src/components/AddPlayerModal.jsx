import { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import './AppModal.css';

const MAX_NAME_LENGTH = 10;

const TEAMS = [
  { id: 'blue', label: 'Azul', swatch: 'var(--player-blue)' },
  { id: 'red', label: 'Rojo', swatch: 'var(--player-red)' },
];

function AddPlayerModal({ show, onClose, onAdd }) {
  const [name, setName] = useState('');
  const [team, setTeam] = useState(null);

  const canSubmit = name.trim().length > 0 && team != null;

  const handleAdd = () => {
    if (!canSubmit) return;
    onAdd(name.trim(), team);
    setName('');
    setTeam(null);
  };

  const handleExited = () => {
    setName('');
    setTeam(null);
  };

  return (
    <Modal show={show} onHide={onClose} onExited={handleExited} contentClassName="app-modal">
      <div className="app-modal__handle" />
      <Modal.Header closeButton>
        <div className="app-modal__header-content">
          <div className="app-modal__icon app-modal__icon--orange">🏃</div>
          <div>
            <Modal.Title className="app-modal__title">Nuevo jugador</Modal.Title>
            {/*<p className="app-modal__subtitle">Agregá un jugador a tu equipo.</p>*/}
          </div>
        </div>
      </Modal.Header>
      <Modal.Body>
        <Form.Group controlId="playerName">
          <div className="app-input-group">
            <span className="app-input-group__icon">👤</span>
            <Form.Control
              type="text"
              maxLength={MAX_NAME_LENGTH}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre del jugador..."
            />
          </div>
          <div className="app-field-row">
            <span className="app-field-hint">Max {MAX_NAME_LENGTH} caracteres</span>
            <span className="app-field-counter">
              {name.length}/{MAX_NAME_LENGTH}
            </span>
          </div>
        </Form.Group>

        <p className="app-section-label">Asignar Equipo</p>
        <div className="team-picker">
          {TEAMS.map((t) => (
            <button
              type="button"
              key={t.id}
              className={`team-picker__option team-picker__option--${t.id}${
                team === t.id ? ' team-picker__option--selected' : ''
              }`}
              onClick={() => setTeam(t.id)}
              aria-pressed={team === t.id}
            >
              <span className="team-picker__swatch" style={{ background: t.swatch }} />
              <span className="team-picker__label">{t.label}</span>
            </button>
          ))}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="app-btn app-btn--primary" disabled={!canSubmit} onClick={handleAdd}>
          ✓ Agregar jugador
        </button>
        <button type="button" className="app-btn app-btn--secondary" onClick={onClose}>
          Cancelar
        </button>
      </Modal.Footer>
    </Modal>
  );
}

export default AddPlayerModal;
