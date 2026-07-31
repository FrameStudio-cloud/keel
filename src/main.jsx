import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"
import '@fontsource-variable/newsreader'
import './index.css'
import { initPostHog } from './lib/posthog'
import { processQueue } from './lib/writeQueue'
import App from './App.jsx'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
  })
}

// eslint-disable-next-line react-refresh/only-export-components
function PostHogInit() {
  useEffect(() => { initPostHog() }, [])
  return null
}

// eslint-disable-next-line react-refresh/only-export-components
function QueueInit() {
  useEffect(() => { processQueue() }, [])
  return null
}

const container = document.getElementById('root')
const root = createRoot(container)
root.render(
  <StrictMode>
    <HelmetProvider>
      <App />
      <Analytics />
      <SpeedInsights />
      <PostHogInit />
      <QueueInit />
    </HelmetProvider>
  </StrictMode>,
)

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    root.unmount()
  })
}
