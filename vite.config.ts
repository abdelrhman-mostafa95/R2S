import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: false,
      includeAssets: [
        'price_table.json',
        'images/R2S_logo-removebg.png',
        'icons/*.png',
        'splash/*.png',
      ],
      workbox: {
        navigateFallback: 'index.html',
        globPatterns: ['**/*.{js,css,html,json,webmanifest,png,woff,woff2}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  test: {
    environment: 'jsdom',
  },
})
