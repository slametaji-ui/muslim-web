import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo-muslimapp.png', 'favicon.ico', 'robots.txt', 'apple-touch-icon.png', 'firebase-messaging-sw.js'],
      manifest: {
        name: 'Qolbi',
        short_name: 'Qolbi',
        description: 'Qolbi: Pendamping Muslim Modern',
        gcm_sender_id: '103953800507',
        theme_color: '#059669',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'logo-muslimapp.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo-muslimapp.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'logo-muslimapp.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      } as any
    })
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
