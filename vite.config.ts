import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',

  optimizeDeps: {
    exclude: ['lucide-react'],
  },

  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },

  server: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: ['merlindesk.com'],
  },
});
