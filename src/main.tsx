import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const rootElement = document.getElementById('root')!

// Prerendered public pages arrive with real markup already inside #root
// (see scripts/prerender.tsx); hydrate onto it rather than re-rendering
// from scratch. Routes that are not prerendered (the dev server, and the
// draft /technical, /docs, /technical-review shells) start with an empty
// #root and mount normally.
if (rootElement.hasChildNodes()) {
  hydrateRoot(
    rootElement,
    <StrictMode>
      <App />
    </StrictMode>,
  )
} else {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
