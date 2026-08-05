import Button from 'react-bootstrap/Button';
import './TopBar.css';

function TopBar({ onSave, saving, canSave = true, formationAuthor }) {
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
      <Button
        variant="light"
        className="top-bar__save"
        onClick={onSave}
        disabled={saving || !canSave}
        aria-label="Guardar y compartir"
        title={canSave ? undefined : 'Agregá al menos un jugador para guardar'}
      >
        💾 Guardar
      </Button>
    </div>
  );
}

export default TopBar;
