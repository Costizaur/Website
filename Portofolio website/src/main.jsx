import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Self-hosted fonts. Archivo (with its width axis) is the home screen, Geist is the body text,
// and three of the folder worlds bring their own: Bricolage Grotesque for UI/UX,
// JetBrains Mono for Web and Lilita One for Games. The Apps world uses the system font.
import '@fontsource-variable/archivo/wdth.css'
import '@fontsource-variable/geist/index.css'
import '@fontsource-variable/bricolage-grotesque/standard.css'
import '@fontsource-variable/jetbrains-mono/index.css'
import '@fontsource/lilita-one/latin-400.css'
import './index.css' // Import global styles
import App from './App.jsx' // Import main component

// Find the 'root' div in index.html and render the App inside it
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
