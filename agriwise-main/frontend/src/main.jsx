import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { LanguageProvider } from './i18n/LanguageContext'
import { LocationProvider } from './context/LocationContext'
import LocationModal from './components/LocationModal'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <LocationProvider>
        <App />
        <LocationModal />
      </LocationProvider>
    </LanguageProvider>
  </StrictMode>,
)
