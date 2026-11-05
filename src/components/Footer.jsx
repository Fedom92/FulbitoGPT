import { useState } from 'react';
import DonateModal from './DonateModal.jsx';
import { track } from '../services/analytics.js';
import './Footer.css';

function Footer() {
  const [showDonateModal, setShowDonateModal] = useState(false);

  const openDonate = () => {
    setShowDonateModal(true);
    track('donate_opened');
  };

  return (
    <>
      <footer className="board-footer">
        Invitate una coca{' '}
        <button type="button" className="board-footer__link" onClick={openDonate}>
          ACÁ
        </button>
        {' | Contacto '}
        <a
          href="https://forms.gle/4CrPoGP1ppixege8A"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track('contact_clicked')}
        >
          ACÁ
        </a>
      </footer>
      <DonateModal show={showDonateModal} onClose={() => setShowDonateModal(false)} />
    </>
  );
}

export default Footer;
