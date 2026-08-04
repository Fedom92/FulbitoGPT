import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormation } from '../hooks/useFormation.js';
import { useContainedSize } from '../hooks/useContainedSize.js';
import { getFormation, createFormation } from '../services/formations.js';
import { makePlayerId } from '../utils/id.js';
import TopBar from '../components/TopBar.jsx';
import SoccerField from '../components/SoccerField.jsx';
import Player from '../components/Player.jsx';
import DeleteZone from '../components/DeleteZone.jsx';
import AddPlayerButton from '../components/AddPlayerButton.jsx';
import AddPlayerModal from '../components/AddPlayerModal.jsx';
import DeleteConfirmModal from '../components/DeleteConfirmModal.jsx';
import AuthorNameModal from '../components/AuthorNameModal.jsx';
import SaveShareModal from '../components/SaveShareModal.jsx';
import './FormationBoard.css';

function FormationBoard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, actions } = useFormation();
  const fieldAreaRef = useRef(null);
  const fieldRef = useRef(null);
  const fieldSize = useContainedSize(fieldAreaRef, 68, 105);

  const [armedPlayerId, setArmedPlayerId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [saveModal, setSaveModal] = useState({ show: false, status: 'saving', link: '', error: '' });
  const [authorName, setAuthorName] = useState('');
  const [showAuthorPrompt, setShowAuthorPrompt] = useState(false);
  const [loadedAuthorName, setLoadedAuthorName] = useState('');

  useEffect(() => {
    if (!id) {
      actions.loadPlayers([]);
      setLoadedAuthorName('');
      return;
    }
    if (id === state.lastSavedId) {
      return;
    }

    let cancelled = false;
    setLoadError('');
    actions.loadStart();

    getFormation(id)
      .then((formation) => {
        if (cancelled) return;
        if (!formation) {
          navigate('/', { replace: true });
          return;
        }
        actions.loadPlayers(formation.players ?? []);
        setLoadedAuthorName(formation.authorName || '');
      })
      .catch(() => {
        if (cancelled) return;
        setLoadError('No se pudo cargar la formación. Revisá tu conexión e intentá de nuevo.');
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAddPlayer = (name, team) => {
    actions.addPlayer({ id: makePlayerId(), name, team, x: 50, y: 50 });
    setShowAddModal(false);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) actions.removePlayer(deleteTarget.id);
    setDeleteTarget(null);
  };

  const performSave = async (name) => {
    setSaveModal({ show: true, status: 'saving', link: '', error: '' });
    try {
      const players = state.players.map((p) => ({
        id: p.id,
        name: p.name,
        team: p.team === 'red' ? 'red' : 'blue',
        x: Math.round(p.x * 100) / 100,
        y: Math.round(p.y * 100) / 100,
      }));
      const newId = await createFormation(players, name);
      actions.markSaved(newId);
      setLoadedAuthorName(name);
      navigate(`/f/${newId}`, { replace: true });
      setSaveModal({
        show: true,
        status: 'ready',
        link: `${window.location.origin}/f/${newId}`,
        error: '',
      });
    } catch (err) {
      setSaveModal({ show: true, status: 'error', link: '', error: err?.message ?? '' });
    }
  };

  const handleSaveClick = () => {
    if (authorName) {
      performSave(authorName);
    } else {
      setShowAuthorPrompt(true);
    }
  };

  const handleAuthorNameConfirm = (name) => {
    setAuthorName(name);
    setShowAuthorPrompt(false);
    performSave(name);
  };

  return (
    <div className="board">
      <TopBar
        onSave={handleSaveClick}
        saving={saveModal.show && saveModal.status === 'saving'}
        formationAuthor={loadedAuthorName}
      />

      <div className="board__field-area" ref={fieldAreaRef}>
        {loadError && (
          <div className="board__error-banner">
            {loadError}{' '}
            <button type="button" onClick={() => navigate(0)}>
              Reintentar
            </button>
          </div>
        )}

        <div
          className="board__field-wrapper"
          ref={fieldRef}
          style={fieldSize.width ? { width: fieldSize.width, height: fieldSize.height } : undefined}
        >
          <SoccerField />
          <div className="board__players-layer">
            {state.players.map((player) => (
              <Player
                key={player.id}
                player={player}
                fieldRef={fieldRef}
                onMove={actions.movePlayer}
                onDelete={actions.removePlayer}
                onRequestDelete={() => setDeleteTarget(player)}
                onLongPressStart={setArmedPlayerId}
                onLongPressEnd={() => setArmedPlayerId(null)}
              />
            ))}
          </div>
          {state.status === 'loading' && (
            <div className="board__loading-overlay">Cargando...</div>
          )}
        </div>
      </div>

      <AddPlayerButton onClick={() => setShowAddModal(true)} />
      <DeleteZone visible={armedPlayerId != null} />

      <AddPlayerModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddPlayer}
      />

      <DeleteConfirmModal
        player={deleteTarget}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <AuthorNameModal
        show={showAuthorPrompt}
        onClose={() => setShowAuthorPrompt(false)}
        onConfirm={handleAuthorNameConfirm}
      />

      <SaveShareModal
        show={saveModal.show}
        onClose={() => setSaveModal((s) => ({ ...s, show: false }))}
        status={saveModal.status}
        link={saveModal.link}
        error={saveModal.error}
        onRetry={() => performSave(authorName)}
      />
    </div>
  );
}

export default FormationBoard;
