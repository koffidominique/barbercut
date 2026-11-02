'use client'

import { useEffect } from 'react'

export function SWRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('Service Worker enregistré :', registration.scope)
          registration.addEventListener('updatefound', () => {
            const installingWorker = registration.installing
            if (installingWorker) {
              installingWorker.addEventListener('statechange', () => {
                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  ;(window as any).__newSWAvailable = true
                }
              })
            }
          })
        })
        .catch((error) => {
          console.error('Erreur enregistrement Service Worker :', error)
        })
    }
  }, [])

  return null
}
