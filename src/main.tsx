import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

const isLocalHost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const originalWarn = console.warn;
console.warn = (...args: any[]) => {
  const msg = args[0];
  if (typeof msg === 'string') {
    if (
      msg.includes('THREE.Clock') ||
      msg.includes('deprecated') ||
      (!isLocalHost && (
        msg.includes('unreachable') ||
        msg.includes('offline') ||
        msg.includes('fallback')
      ))
    ) {
      return;
    }
  }
  originalWarn(...args);
};

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
