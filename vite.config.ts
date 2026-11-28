import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { agentDiscoveryPlugin } from './scripts/agent/agent-discovery-plugin';
import { synchronizeHomeStructuredData } from './scripts/build/structured-data.mjs';

export default defineConfig({
  plugins: [react(), agentDiscoveryPlugin(), {
    name: 'sellico-structured-data',
    transformIndexHtml: synchronizeHomeStructuredData,
  }],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    // Нужен пререндеру: по нему он находит JSON-чанк страницы для modulepreload, затем удаляет.
    manifest: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react';
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'motion';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'icons';
          }
          return undefined;
        },
      },
    },
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    // dev-only: баннеры и их картинки берём с прода, чтобы слайдер работал на локалке
    proxy: {
      '/api': { target: process.env.SELLICO_DEV_API_TARGET || 'https://sellico.ru', changeOrigin: true },
      '/storage': { target: process.env.SELLICO_DEV_API_TARGET || 'https://sellico.ru', changeOrigin: true },
    },
  },
});
