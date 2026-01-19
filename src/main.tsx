import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Accueil from './pages/accueil_page/accueil'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Accueil />
  </StrictMode>,
)
