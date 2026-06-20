import { createRoot } from 'react-dom/client'
import { AppStateProvider } from './AppStateContext'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <AppStateProvider>
    <App />
  </AppStateProvider>
)
