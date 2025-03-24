// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    rollupOptions: {
      external: [
        'pdfjs-dist',
        'tesseract.js',
        'papaparse',
        'mammoth',
        'jszip'
      ]
    }
  }
})

