import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      // This project lives under ~/Documents, which is iCloud-synced. iCloud's
      // background sync fires phantom filesystem events (without changing file
      // mtimes), which Vite's default FSEvents watcher mistakes for edits and
      // force-reloads on every minute or two. Polling compares mtimes — which
      // are stable — so it ignores the iCloud noise and only reacts to real
      // edits. (Proper long-term fix: move the repo out of ~/Documents.)
      usePolling: true,
      interval: 400,
      ignored: ['**/dist/**'],
    },
  },
  build: {
    // This rolldown-vite version's CSS minifiers crash on our stylesheet
    // (both the default and 'esbuild' throw inside vite:css-post). CSS is
    // small; skip CSS minification (JS is still minified).
    cssMinify: false,
  },
})
