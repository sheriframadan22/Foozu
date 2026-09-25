import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png', 'brand/*.png'],
      manifest: {
        name: 'FOOZU — Rewarding Every Moment',
        short_name: 'FOOZU',
        description: 'FOOZU on-ground quiz activation game',
        theme_color: '#28286E',
        background_color: '#28286E',
        display: 'standalone',
        orientation: 'landscape',
        start_url: '.',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,json,woff2}'],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024
      }
    })
  ],
  build: {
    outDir: 'dist',
    sourcemap: false,
    // The whole question bank (2,500 bilingual questions) is bundled for offline-first
    // play, so a single chunk over 500kB is expected here, not a red flag.
    chunkSizeWarningLimit: 2000
  },
  server: {
    host: true,
    port: 5173
  }
});
