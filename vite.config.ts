import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Loads .env / .env.local etc without requiring the VITE_ prefix, so the
  // same PUBLIC_SITE_URL / GOOGLE_SITE_VERIFICATION / BING_SITE_VERIFICATION
  // / GA_MEASUREMENT_ID env vars work identically here, in server/index.js
  // and in scripts/prerender.tsx. See SEO_SETUP.md.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    define: {
      'process.env.PUBLIC_SITE_URL': JSON.stringify(env.PUBLIC_SITE_URL || ''),
      'process.env.GOOGLE_SITE_VERIFICATION': JSON.stringify(env.GOOGLE_SITE_VERIFICATION || ''),
      'process.env.BING_SITE_VERIFICATION': JSON.stringify(env.BING_SITE_VERIFICATION || ''),
      'process.env.GA_MEASUREMENT_ID': JSON.stringify(env.GA_MEASUREMENT_ID || ''),
    },
    build: {
      manifest: true,
    },
    server: {
      proxy: {
        // Run `npm run server` alongside `npm run dev` for the working-session form to submit locally.
        '/api': 'http://localhost:8080',
      },
    },
  }
})
