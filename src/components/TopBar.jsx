import Button from 'react-bootstrap/Button';
import './TopBar.css';
import logo from '../assets/logo_simple.webp';

function TopBar({ onSave, saving, formationAuthor }) {
  return (
        <div className="top-bar">
      <div className="top-bar__title">
        <span className="top-bar__brand">
         ⚽ FulbitoGPT
        </span>

        {formationAuthor && (
          <span className="top-bar__author">
            | Formación de {formationAuthor}
          </span>
        )}
      </div>
      <Button variant="light" className="top-bar__save" onClick={onSave} disabled={saving} aria-label="Guardar y compartir">
        💾 Guardar
      </Button>
    </div>
  );
}

export default TopBar;
