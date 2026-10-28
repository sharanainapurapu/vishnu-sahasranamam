import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Register the audio-caching service worker (BASE_URL-aware so it works at '/'
// in dev and '/vsn/' on GitHub Pages). Caches played clips so repeat practice
// costs no extra network. Failure is non-fatal — the app still fetches audio.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const base = import.meta.env.BASE_URL || '/'
    navigator.serviceWorker.register(`${base}sw.js`).catch((e) => {
      console.warn('Service worker registration failed:', e)
    })
  })
}
