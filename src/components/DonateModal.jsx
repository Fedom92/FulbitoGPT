import { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { copyToClipboard } from '../utils/share.js';
import './AppModal.css';

const ALIAS = 'fed.lemon26';

function DonateModal({ show, onClose }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyToClipboard(ALIAS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal show={show} onHide={onClose} onExited={() => setCopied(false)} contentClassName="app-modal">
      <div className="app-modal__handle" />
      <Modal.Header closeButton />
      <Modal.Body>
        <p className="app-modal__title mb-2">Alias para colaborar:</p>
        <div className="app-code-row">
          <code className="app-code-row__text">{ALIAS}</code>
          <button type="button" className="app-code-row__copy" onClick={handleCopy} aria-label="Copiar alias">
            {copied ? '✓' : '📋'}
          </button>
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default DonateModal;
