import { useMemo, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { MAX_PLAYER_NAME_LENGTH, MODE_MATCH, parsePlayerList } from '../utils/formation.js';
import './AppModal.css';

const TEAMS = [
  { id: 'blue', label: 'Azul', matchHint: 'arriba', swatch: 'var(--player-blue)' },
  { id: 'red', label: 'Rojo', matchHint: 'abajo', swatch: 'var(--player-red)' },
];

const DISTRIBUTIONS = [
  { id: 'random', label: '🎲 Al azar', hint: 'Mezcla la lista y arma dos equipos parejos.' },
  { id: 'ordered', label: '📋 En orden', hint: 'La primera mitad de la lista va arriba (azul) y el resto abajo (rojo).' },
];

const LIST_PLACEHOLDER = '1. Juan\n2. Pepe ✅\n3. El Tano\n...';

function TeamPicker({ value, onChange, showHints }) {
  return (
    <div className="team-picker">
      {TEAMS.map((t) => (
        <button
          type="button"
          key={t.id}
          className={`team-picker__option team-picker__option--${t.id}${
            value === t.id ? ' team-picker__option--selected' : ''
          }`}
          onClick={() => onChange(t.id)}
          aria-pressed={value === t.id}
        >
          <span className="team-picker__swatch" style={{ background: t.swatch }} />
          <span className="team-picker__label">{t.label}</span>
          {showHints && <span className="app-field-hint">{t.matchHint}</span>}
        </button>
      ))}
    </div>
  );
}

// boardMode: 'team' (one team over the whole pitch) or 'match' (two halves).
function AddPlayerModal({ show, onClose, onAdd, onAddMany, playerCount, maxPlayers, boardMode }) {
  const isMatch = boardMode === MODE_MATCH;
  // In match mode the color decides the half, so it must be picked on purpose;
  // in team mode most players share a color, so blue is preselected.
  const defaultTeam = isMatch ? null : 'blue';

  const [tab, setTab] = useState('single'); // single | list
  const [name, setName] = useState('');
  const [team, setTeam] = useState(undefined);
  const [listText, setListText] = useState('');
  const [distribution, setDistribution] = useState('random');

  const selectedTeam = team === undefined ? defaultTeam : team;
  const listTeam = selectedTeam ?? 'blue';

  const slotsLeft = Math.max(0, maxPlayers - playerCount);
  const parsedNames = useMemo(() => parsePlayerList(listText), [listText]);
  const namesToAdd = parsedNames.slice(0, slotsLeft);

  const canAddSingle = name.trim().length > 0 && selectedTeam != null;
  const canAddList = namesToAdd.length > 0;

  const reset = () => {
    setTab('single');
    setName('');
    setTeam(undefined);
    setListText('');
    setDistribution('random');
  };

  const handleAdd = () => {
    if (tab === 'single') {
      if (!canAddSingle) return;
      onAdd(name.trim(), selectedTeam);
    } else {
      if (!canAddList) return;
      onAddMany(namesToAdd, isMatch ? { distribution } : { team: listTeam });
    }
    reset();
  };

  const activeDistribution = DISTRIBUTIONS.find((d) => d.id === distribution);

  return (
    <Modal show={show} onHide={onClose} onExited={reset} contentClassName="app-modal">
      <div className="app-modal__handle" />
      <Modal.Header closeButton>
        <div className="app-modal__header-content">
          <div className="app-modal__icon app-modal__icon--orange">🏃</div>
          <div>
            <Modal.Title className="app-modal__title">Agregar jugadores</Modal.Title>
            <p className="app-modal__subtitle">
              {slotsLeft} {slotsLeft === 1 ? 'lugar disponible' : 'lugares disponibles'}
            </p>
          </div>
        </div>
      </Modal.Header>
      <Modal.Body>
        <div className="app-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'single'}
            className={`app-tabs__tab${tab === 'single' ? ' app-tabs__tab--active' : ''}`}
            onClick={() => setTab('single')}
          >
            👤 Uno
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'list'}
            className={`app-tabs__tab${tab === 'list' ? ' app-tabs__tab--active' : ''}`}
            onClick={() => setTab('list')}
          >
            📋 Pegar lista
          </button>
        </div>

        {tab === 'single' ? (
          <>
            <Form.Group controlId="playerName">
              <div className="app-input-group">
                <span className="app-input-group__icon">👤</span>
                <Form.Control
                  type="text"
                  maxLength={MAX_PLAYER_NAME_LENGTH}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAdd();
                  }}
                  placeholder="Nombre del jugador..."
                />
              </div>
              <div className="app-field-row">
                <span className="app-field-hint">Máx. {MAX_PLAYER_NAME_LENGTH} caracteres</span>
                <span className="app-field-counter">
                  {name.length}/{MAX_PLAYER_NAME_LENGTH}
                </span>
              </div>
            </Form.Group>

            <p className="app-section-label">{isMatch ? 'Equipo' : 'Color'}</p>
            <TeamPicker value={selectedTeam} onChange={setTeam} showHints={isMatch} />
          </>
        ) : (
          <>
            <Form.Group controlId="playerList">
              <Form.Control
                as="textarea"
                rows={6}
                value={listText}
                onChange={(e) => setListText(e.target.value)}
                placeholder={LIST_PLACEHOLDER}
                className="app-textarea"
              />
              <div className="app-field-row">
                <span className="app-field-hint">Pegá la lista del grupo, un jugador por línea.</span>
              </div>
            </Form.Group>

            {parsedNames.length > 0 && (
              <>
                <p className="app-section-label">
                  {parsedNames.length} {parsedNames.length === 1 ? 'jugador' : 'jugadores'}
                </p>
                <div className="app-chips">
                  {parsedNames.map((n, i) => (
                    <span key={i} className={`app-chip${i >= slotsLeft ? ' app-chip--excluded' : ''}`}>
                      {n}
                    </span>
                  ))}
                </div>
                {parsedNames.length > slotsLeft && (
                  <p className="app-section-hint text-danger mt-2">
                    Máximo {maxPlayers} jugadores: se agregan solo los primeros {slotsLeft}.
                  </p>
                )}

                {isMatch ? (
                  <>
                    <p className="app-section-label">Repartir</p>
                    <div className="team-picker">
                      {DISTRIBUTIONS.map((d) => (
                        <button
                          type="button"
                          key={d.id}
                          className={`team-picker__option${
                            distribution === d.id ? ' team-picker__option--selected team-picker__option--neutral' : ''
                          }`}
                          onClick={() => setDistribution(d.id)}
                          aria-pressed={distribution === d.id}
                        >
                          <span className="team-picker__label">{d.label}</span>
                        </button>
                      ))}
                    </div>
                    <p className="app-section-hint mt-2">{activeDistribution.hint}</p>
                  </>
                ) : (
                  <>
                    <p className="app-section-label">Color</p>
                    <TeamPicker value={listTeam} onChange={setTeam} showHints={false} />
                  </>
                )}
              </>
            )}
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <button
          type="button"
          className="app-btn app-btn--primary"
          disabled={tab === 'single' ? !canAddSingle : !canAddList}
          onClick={handleAdd}
        >
          {tab === 'single'
            ? '✓ Agregar jugador'
            : `✓ Agregar ${namesToAdd.length || ''} ${namesToAdd.length === 1 ? 'jugador' : 'jugadores'}`}
        </button>
        <button type="button" className="app-btn app-btn--secondary" onClick={onClose}>
          Cancelar
        </button>
      </Modal.Footer>
    </Modal>
  );
}

export default AddPlayerModal;
