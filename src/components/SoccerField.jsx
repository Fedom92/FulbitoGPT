import './SoccerField.css';

// Real pitch proportions in meters (68 x 105), vertical orientation.
function SoccerField() {
  return (
    <svg
      className="soccer-field"
      viewBox="0 0 68 105"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <rect x="0" y="0" width="68" height="105" className="field-turf" />

      {/* touchlines */}
      <rect x="0" y="0" width="68" height="105" className="field-line" fill="none" />

      {/* halfway line + center circle */}
      <line x1="0" y1="52.5" x2="68" y2="52.5" className="field-line" />
      <circle cx="34" cy="52.5" r="9.15" className="field-line" fill="none" />
      <circle cx="34" cy="52.5" r="0.3" className="field-spot" />

      {/* top penalty area */}
      <rect x="13.84" y="0" width="40.32" height="16.5" className="field-line" fill="none" />
      <rect x="24.84" y="0" width="18.32" height="5.5" className="field-line" fill="none" />
      <circle cx="34" cy="11" r="0.3" className="field-spot" />
      <path d="M 26.69 16.5 A 9.15 9.15 0 0 0 41.31 16.5" className="field-line" fill="none" />

      {/* bottom penalty area */}
      <rect x="13.84" y="88.5" width="40.32" height="16.5" className="field-line" fill="none" />
      <rect x="24.84" y="99.5" width="18.32" height="5.5" className="field-line" fill="none" />
      <circle cx="34" cy="94" r="0.3" className="field-spot" />
      <path d="M 26.69 88.5 A 9.15 9.15 0 0 1 41.31 88.5" className="field-line" fill="none" />

      {/* goals (arcos) */}
      <line x1="30.34" y1="0.15" x2="37.66" y2="0.15" className="field-goal" />
      <line x1="30.34" y1="104.85" x2="37.66" y2="104.85" className="field-goal" />

      {/* corner arcs */}
      <path d="M 0 1 A 1 1 0 0 0 1 0" className="field-line" fill="none" />
      <path d="M 67 0 A 1 1 0 0 0 68 1" className="field-line" fill="none" />
      <path d="M 68 104 A 1 1 0 0 0 67 105" className="field-line" fill="none" />
      <path d="M 1 105 A 1 1 0 0 0 0 104" className="field-line" fill="none" />
    </svg>
  );
}

export default SoccerField;
