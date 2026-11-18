import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import AppLayoutPreview from './components/layout/AppLayoutPreview.jsx'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AppLayoutPreview />
    </BrowserRouter>
  </StrictMode>,
)