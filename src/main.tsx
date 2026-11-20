/// <reference types="vite/client" />
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Native Cyrillic + Latin variable editorial typography (zero CDN latency)
import '@fontsource-variable/golos-text';
import '@fontsource-variable/inter';
import '@fontsource-variable/literata/opsz.css';
import '@fontsource-variable/literata/opsz-italic.css';
import '@fontsource-variable/jetbrains-mono';

import './index.css';
import App from './App';

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
