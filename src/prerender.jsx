import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import Homepage from './pages/Homepage'

export function prerender() {
  const helmetContext = {}
  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <StaticRouter location="/">
        <Homepage />
      </StaticRouter>
    </HelmetProvider>
  )

  const { helmet } = helmetContext
  let head = ''
  if (helmet) {
    head += helmet.title.toString()
    head += helmet.meta.toString()
    head += helmet.link.toString()
  }

  return { html, head }
}
