'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('EKKLESIA Service Worker registrado con éxito:', registration.scope);
          })
          .catch((error) => {
            console.warn('Error al registrar Service Worker:', error);
          });
      });
    }
  }, []);

  return null;
}
