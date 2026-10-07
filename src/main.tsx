import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/app/App'
import { initI18n } from '@/i18n'
import './index.css'

const root = document.getElementById('root')

if (!root) {
  throw new Error('Root element #root was not found')
}

await initI18n()

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
