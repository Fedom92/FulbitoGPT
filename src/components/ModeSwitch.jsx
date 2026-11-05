import { MODE_MATCH, MODE_TEAM } from '../utils/formation.js';
import './ModeSwitch.css';

const MODES = [
  { id: MODE_TEAM, label: '👕 Mi equipo' },
  { id: MODE_MATCH, label: '⚔️ Partido' },
];

function ModeSwitch({ mode, onChange }) {
  return (
    <div className="mode-switch" role="tablist" aria-label="Modo">
      {MODES.map((m) => (
        <button
          key={m.id}
          type="button"
          role="tab"
          aria-selected={mode === m.id}
          className={`mode-switch__option${mode === m.id ? ' mode-switch__option--active' : ''}`}
          onClick={() => onChange(m.id)}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}

export default ModeSwitch;
