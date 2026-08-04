import { useCallback, useReducer } from 'react';

const initialState = {
  players: [],
  status: 'idle', // idle | loading | ready
  lastSavedId: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, status: 'loading' };
    case 'LOAD_SUCCESS':
      return { ...state, status: 'ready', players: action.players };
    case 'ADD_PLAYER':
      return { ...state, players: [...state.players, action.player] };
    case 'MOVE_PLAYER':
      return {
        ...state,
        players: state.players.map((p) =>
          p.id === action.id ? { ...p, x: action.x, y: action.y } : p
        ),
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
  const loadPlayers = useCallback(
    (players) => dispatch({ type: 'LOAD_SUCCESS', players }),
    []
  );
  const addPlayer = useCallback(
    (player) => dispatch({ type: 'ADD_PLAYER', player }),
    []
  );
  const movePlayer = useCallback(
    (id, x, y) => dispatch({ type: 'MOVE_PLAYER', id, x, y }),
    []
  );
  const removePlayer = useCallback(
    (id) => dispatch({ type: 'REMOVE_PLAYER', id }),
    []
  );
  const markSaved = useCallback((id) => dispatch({ type: 'MARK_SAVED', id }), []);

  return {
    state,
    actions: { loadStart, loadPlayers, addPlayer, movePlayer, removePlayer, markSaved },
  };
}
