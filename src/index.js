// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// ❌ Service Worker DEVRE DIŞI - Cache sorunu önlendi
serviceWorkerRegistration.unregister();

console.log('🚫 Service Worker devre dışı bırakıldı - Her zaman güncel kod çalışacak');