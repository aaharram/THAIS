import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import fs from 'fs'

export default defineConfig(() => ({
    server: {
    host: '0.0.0.0',
    port: 5274,
    https: {
      key: fs.readFileSync('./crts/localhost-key.pem'),
      cert: fs.readFileSync('./crts/localhost-cert.pem'),
    },
  },
  base: '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'THAIS',
        short_name: 'THAIS',
        description: 'Gestion locative et patrimoine',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#3f51b5',
        icons: [
          {
            src: 'android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'favicon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: [
            'react',
            'react-dom',
            'react-router',
            'react-router-dom',
            'react-redux',
            '@reduxjs/toolkit',
            'axios',
            'zod',
            'date-fns',
            'clsx',
            'framer-motion',
            '@tanstack/react-table',
            '@hookform/resolvers',
            'react-hook-form',
            'react-day-picker',
            'react-hot-toast',
            'lucide-react',
            '@radix-ui/react-icons',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-popover',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip',
          ],
        },
      },
    },
    chunkSizeWarningLimit: 1500,
  },
}));
