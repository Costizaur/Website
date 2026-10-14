import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// The same self-hosted fonts as the portfolio: Archivo for big numbers, Geist for reading,
// and JetBrains Mono, the Web folder's display face, for headings and figures.
import '@fontsource-variable/archivo/wdth.css'
import '@fontsource-variable/geist/index.css'
import '@fontsource-variable/jetbrains-mono/index.css'
import './finance.css'
import FinanceApp from './FinanceApp.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <FinanceApp />
  </StrictMode>,
)
