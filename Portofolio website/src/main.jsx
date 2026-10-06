import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Self-hosted fonts: Bricolage Grotesque (display, with its width axis) and Geist (text)
import '@fontsource-variable/bricolage-grotesque/standard.css'
import '@fontsource-variable/geist/index.css'
import './index.css' // Import global styles
import App from './App.jsx' // Import main component

// Find the 'root' div in index.html and render the App inside it
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
