import Button from 'react-bootstrap/Button';
import './TopBar.css';

function TopBar({ onSave, saving, formationAuthor }) {
  return (
    <div className="top-bar">
      <span className="top-bar__title">
        {formationAuthor ? `Formación de ${formationAuthor}` : '⚽ FulbitoGPT'}
      </span>
      <Button variant="light" className="top-bar__save" onClick={onSave} disabled={saving} aria-label="Guardar y compartir">
        💾 Guardar
      </Button>
    </div>
  );
}

export default TopBar;
