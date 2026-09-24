import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import { SiteShell } from './components/SiteShell'

/**
 * SSR entry point used only by scripts/prerender.mjs (via Vite's
 * ssrLoadModule, so import.meta.env and all existing Vite plugins resolve
 * exactly as they do in the real client build). Not used by the browser.
 */
export function render(path: string): string {
  return renderToString(
    <StaticRouter location={path}>
      <SiteShell forceProd />
    </StaticRouter>,
  )
}
