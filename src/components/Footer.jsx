import { useState } from 'react';
import DonateModal from './DonateModal.jsx';
import './Footer.css';

function Footer() {
  const [showDonateModal, setShowDonateModal] = useState(false);

  return (
    <>
      <footer className="board-footer">
        Invitate una coca{' '}
        <button type="button"
          className="board-footer__link"
          onClick={() => setShowDonateModal(true)
          }>
          ACÁ
        </button>
        {' | Contacto '}
        <a href="https://forms.gle/4CrPoGP1ppixege8A" target="_blank" rel="noopener noreferrer">
          ACÁ
        </a>
      </footer>
      <DonateModal show={showDonateModal} onClose={() => setShowDonateModal(false)} />
    </>
  );
}

export default Footer;
