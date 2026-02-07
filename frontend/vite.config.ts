import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: '.', // frontend folder is the root
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // allows import like "@/components/Component"
    },
  },
  server: {
    port: 5173, // explicit port
    open: true, // automatically open browser
    proxy: {
      '/api': {
        target: 'http://localhost:3001', // backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist', // build output folder
  },
});
