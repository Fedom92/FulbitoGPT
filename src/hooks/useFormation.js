import { useCallback, useReducer } from 'react';
import { MODE_MATCH, MODE_TEAM, arrangeForMode, snapshotLayout, teamForY } from '../utils/formation.js';

const initialState = {
  players: [],
  mode: MODE_TEAM,
  // Where each player stood the last time each mode was active: { team?, match? }
  layouts: {},
  status: 'idle', // idle | loading | ready
  lastSavedId: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, status: 'loading' };
    case 'LOAD_SUCCESS':
      return { ...state, status: 'ready', players: action.players, mode: action.mode, layouts: {} };
    case 'ADD_PLAYER':
      return { ...state, players: [...state.players, action.player] };
    case 'SET_PLAYERS':
      return { ...state, players: action.players };
    case 'SET_MODE': {
      if (action.mode === state.mode) return state;
      // Remember the arrangement we leave and restore the one we go back to.
      const layouts = { ...state.layouts, [state.mode]: snapshotLayout(state.players) };
      return {
        ...state,
        mode: action.mode,
        layouts,
        players: arrangeForMode(state.players, action.mode, layouts[action.mode]),
      };
    }
    case 'MOVE_PLAYER':
      return {
        ...state,
        players: state.players.map((p) => {
          if (p.id !== action.id) return p;
          const moved = { ...p, x: action.x, y: action.y };
          // In match mode the half a player stands on decides its team.
          return state.mode === MODE_MATCH ? { ...moved, team: teamForY(action.y) } : moved;
        }),
      };
    case 'RENAME_PLAYER':
      return {
        ...state,
        players: state.players.map((p) => (p.id === action.id ? { ...p, name: action.name } : p)),
      };
    case 'REMOVE_PLAYER':
      return { ...state, players: state.players.filter((p) => p.id !== action.id) };
    case 'MARK_SAVED':
      return { ...state, lastSavedId: action.id };
    default:
      return state;
  }
}

export function useFormation() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadStart = useCallback(() => dispatch({ type: 'LOAD_START' }), []);
  const loadFormation = useCallback(
    (players, mode = MODE_TEAM) => dispatch({ type: 'LOAD_SUCCESS', players, mode }),
    []
  );
  const addPlayer = useCallback((player) => dispatch({ type: 'ADD_PLAYER', player }), []);
  const setPlayers = useCallback((players) => dispatch({ type: 'SET_PLAYERS', players }), []);
  const setMode = useCallback((mode) => dispatch({ type: 'SET_MODE', mode }), []);
  const movePlayer = useCallback((id, x, y) => dispatch({ type: 'MOVE_PLAYER', id, x, y }), []);
  const renamePlayer = useCallback((id, name) => dispatch({ type: 'RENAME_PLAYER', id, name }), []);
  const removePlayer = useCallback((id) => dispatch({ type: 'REMOVE_PLAYER', id }), []);
  const markSaved = useCallback((id) => dispatch({ type: 'MARK_SAVED', id }), []);

  return {
    state,
    actions: {
      loadStart,
      loadFormation,
      addPlayer,
      setPlayers,
      setMode,
      movePlayer,
      renamePlayer,
      removePlayer,
      markSaved,
    },
  };
}
