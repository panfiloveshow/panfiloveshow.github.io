import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
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
      '/api': { target: 'https://sellico.ru', changeOrigin: true },
      '/storage': { target: 'https://sellico.ru', changeOrigin: true },
    },
  },
});
