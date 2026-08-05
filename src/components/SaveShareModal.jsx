import { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Spinner from 'react-bootstrap/Spinner';
import { buildWhatsAppLink, copyToClipboard, shareFormation } from '../utils/share.js';
import logo_wsp from '../assets/whatsapp.webp';
import './AppModal.css';

function SaveShareModal({ show, onClose, status, link, error, onRetry }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyToClipboard(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    await shareFormation(link);
  };

  return (
    <Modal show={show} onHide={onClose} contentClassName="app-modal" onExited={() => setCopied(false)}>
      <div className="app-modal__handle" />
      <Modal.Header closeButton>
        <div className="app-modal__header-content">
          <div className="app-modal__icon app-modal__icon--orange">🔗</div>
          <div>
            <Modal.Title className="app-modal__title">Compartir formación</Modal.Title>
            <p className="app-modal__subtitle">Cualquiera con el enlace puede verla.</p>
          </div>
        </div>
      </Modal.Header>
      <Modal.Body>
        {status === 'saving' && (
          <div className="d-flex align-items-center gap-2 py-2">
            <Spinner animation="border" size="sm" />
            <span>Guardando formación...</span>
          </div>
        )}

        {status === 'error' && (
          <div>
            <p className="text-danger mb-3">No se pudo guardar la formación. {error}</p>
            <button type="button" className="app-btn app-btn--primary" onClick={onRetry}>
              Reintentar
            </button>
          </div>
        )}

        {status === 'ready' && (
          <div>
            <p className="app-field-hint mb-2">Tu formación está lista para compartir:</p>
            <div className="app-input-group mb-3">
              <span className="app-input-group__icon">🔗</span>
              <input type="text" className="form-control" readOnly value={link} />
            </div>
            <div className="d-flex flex-column gap-2">
              {typeof navigator !== 'undefined' && navigator.share && (
                <button type="button" className="app-btn app-btn--primary" onClick={handleShare}>
                  📤 Compartir
                </button>
              )}
              <a
                href={buildWhatsAppLink(link)}
                target="_blank"
                rel="noreferrer"
                className="app-btn d-flex align-items-center justify-content-center gap-2"
                style={{ background: '#25D366', color: '#fff', textAlign: 'center', textDecoration: 'none' }}
              >
                <img src={logo_wsp} alt="" className="app-modal__icon w-auto" style={{ height: '28px' }} />
                WhatsApp
              </a>
              <button type="button" className="app-btn app-btn--secondary" onClick={handleCopy}>
                {copied ? 'Copiado ✓' : 'Copiar enlace'}
              </button>
            </div>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
}

export default SaveShareModal;
