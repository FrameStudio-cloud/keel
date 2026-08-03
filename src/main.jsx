import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"
import '@fontsource-variable/newsreader'
import './index.css'
import { initPostHog } from './lib/posthog'
import posthog from './lib/posthog'
import { processQueue } from './lib/writeQueue'
import App from './App.jsx'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
  })
}

// eslint-disable-next-line react-refresh/only-export-components
function PostHogInit() {
  useEffect(() => {
    initPostHog()
    const handleError = (event) => {
      posthog.captureException(event.error || event.message, {
        error_name: event.error?.name || 'UncaughtError',
        page: window.location.pathname,
        source: 'window',
      })
    }
    const handleRejection = (event) => {
      posthog.captureException(event.reason, {
        error_name: 'UnhandledRejection',
        page: window.location.pathname,
        source: 'promise',
      })
    }
    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleRejection)
    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleRejection)
    }
  }, [])
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
