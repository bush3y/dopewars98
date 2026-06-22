import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // This rolldown-vite version's CSS minifiers crash on our stylesheet
    // (both the default and 'esbuild' throw inside vite:css-post). CSS is
    // small; skip CSS minification (JS is still minified).
    cssMinify: false,
  },
})
