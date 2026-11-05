import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';
import App from './App.jsx';
import { initAnalytics } from './services/analytics.js';
import { preloadFirestore } from './services/formations.js';
import './styles/bootstrap.scss';
import './index.css';

registerSW({ immediate: true });

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// Fetch the non-critical SDKs once the page is interactive.
const whenIdle = window.requestIdleCallback ?? ((cb) => setTimeout(cb, 1500));
whenIdle(() => {
  initAnalytics();
  preloadFirestore();
});
