import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { LanguageProvider } from './i18n/LanguageContext'
import { ToastProvider } from './context/ToastContext'
import { LocationProvider } from './context/LocationContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <LocationProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </LocationProvider>
    </LanguageProvider>
  </StrictMode>,
)
