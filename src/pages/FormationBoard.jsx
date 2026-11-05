import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormation } from '../hooks/useFormation.js';
import { useContainedSize } from '../hooks/useContainedSize.js';
import { getFormation, createFormation } from '../services/formations.js';
import { track } from '../services/analytics.js';
import { makePlayerId } from '../utils/id.js';
import {
  MAX_PLAYERS,
  MODE_MATCH,
  MODE_TEAM,
  addPlayersBalanced,
  addPlayersFullField,
  normalizeMode,
  shuffleTeams,
  spawnPosition,
} from '../utils/formation.js';
import TopBar from '../components/TopBar.jsx';
import ModeSwitch from '../components/ModeSwitch.jsx';
import Footer from '../components/Footer.jsx';
import SoccerField from '../components/SoccerField.jsx';
import Player from '../components/Player.jsx';
import DeleteZone from '../components/DeleteZone.jsx';
import FloatingActions from '../components/FloatingActions.jsx';
import AddPlayerModal from '../components/AddPlayerModal.jsx';
import EditPlayerModal from '../components/EditPlayerModal.jsx';
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

  const [dragZone, setDragZone] = useState(null); // { height, active } while a player is being dragged
  const [editTarget, setEditTarget] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [saveModal, setSaveModal] = useState({ show: false, status: 'saving', link: '', error: '' });
  const [authorName, setAuthorName] = useState('');
  const [showAuthorPrompt, setShowAuthorPrompt] = useState(false);
  const [loadedAuthorName, setLoadedAuthorName] = useState('');

  const playerCount = state.players.length;
  const isMatch = state.mode === MODE_MATCH;

  useEffect(() => {
    if (!id) {
      actions.loadFormation([], MODE_TEAM);
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
        const players = formation.players ?? [];
        const mode = normalizeMode(formation.mode);
        actions.loadFormation(players, mode);
        setLoadedAuthorName(formation.authorName || '');
        track('formation_opened', { player_count: players.length, mode });
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
    actions.addPlayer({ id: makePlayerId(), name, team, ...spawnPosition(state.players, team, state.mode) });
    setShowAddModal(false);
    track('player_added', { method: 'manual', count: 1, mode: state.mode });
  };

  // Match mode balances the list into two halves; team mode places everyone
  // with one color over the whole pitch (first player in goal).
  const handleAddPlayerList = (names, { distribution, team }) => {
    actions.setPlayers(
      isMatch
        ? addPlayersBalanced(state.players, names, distribution)
        : addPlayersFullField(state.players, names, team)
    );
    setShowAddModal(false);
    track('player_added', { method: 'paste', count: names.length, mode: state.mode, ...(isMatch && { distribution }) });
  };

  const handleModeChange = (mode) => {
    if (mode === state.mode) return;
    actions.setMode(mode);
    track('mode_changed', { mode, player_count: playerCount });
  };

  const handleShuffle = () => {
    actions.setPlayers(shuffleTeams(state.players));
    track('teams_shuffled', { player_count: playerCount });
  };

  const handleDeleteByDrag = (playerId) => {
    actions.removePlayer(playerId);
    track('player_deleted', { method: 'drag' });
  };

  const handleRename = (playerId, name) => {
    actions.renamePlayer(playerId, name);
    setEditTarget(null);
    track('player_renamed');
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
      const newId = await createFormation(players, name, state.mode);
      track('formation_created', { player_count: players.length, from_link: Boolean(id), mode: state.mode });
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
    if (playerCount === 0) return;
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
        canSave={playerCount > 0}
        formationAuthor={loadedAuthorName}
      />

      <ModeSwitch mode={state.mode} onChange={handleModeChange} />

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
          <SoccerField showHalves={isMatch} />
          <div className="board__players-layer">
            {state.players.map((player) => (
              <Player
                key={player.id}
                player={player}
                fieldRef={fieldRef}
                onMove={actions.movePlayer}
                onDelete={handleDeleteByDrag}
                onDoubleTap={() => setEditTarget(player)}
                onDragStart={(height) => setDragZone({ height, active: false })}
                onZoneHover={(active) => setDragZone((z) => (z ? { ...z, active } : z))}
                onDragEnd={() => setDragZone(null)}
              />
            ))}
          </div>
          {state.status === 'loading' && <div className="board__loading-overlay">Cargando...</div>}
        </div>
      </div>

      <Footer />

      <FloatingActions
        onAdd={() => setShowAddModal(true)}
        onShuffle={handleShuffle}
        canAdd={playerCount < MAX_PLAYERS}
        showShuffle={isMatch}
        canShuffle={playerCount >= 2}
      />
      <DeleteZone visible={dragZone != null} height={dragZone?.height} active={dragZone?.active} />

      <AddPlayerModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddPlayer}
        onAddMany={handleAddPlayerList}
        playerCount={playerCount}
        maxPlayers={MAX_PLAYERS}
        boardMode={state.mode}
      />

      <EditPlayerModal
        player={editTarget}
        onSave={handleRename}
        onClose={() => setEditTarget(null)}
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
