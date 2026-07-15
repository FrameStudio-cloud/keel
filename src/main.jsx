import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"
import './index.css'
import { initPostHog } from './lib/posthog'
import App from './App.jsx'

function PostHogInit() {
  useEffect(() => { initPostHog() }, [])
  return null
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <App />
      <Analytics />
      <SpeedInsights />
      <PostHogInit />
    </HelmetProvider>
  </StrictMode>,
)
