import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const page = (file) => fileURLToPath(new URL(file, import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/",
  build: {
    outDir: '../docs',
    emptyOutDir: true,
    // Two pages: the portfolio, and the finance dashboard at /finance/
    rollupOptions: {
      input: {
        main: page('./index.html'),
        finance: page('./finance/index.html'),
      },
    },
  }
})
