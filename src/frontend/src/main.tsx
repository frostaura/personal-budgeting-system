import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { initializeServiceWorker } from './services/serviceWorkerManager';

// Initialize service worker
initializeServiceWorker()
  .then((registered) => {
    if (registered) {
      console.log('Service worker registered successfully');
    }
  })
  .catch((error) => {
    console.error('Service worker registration failed:', error);
  });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
