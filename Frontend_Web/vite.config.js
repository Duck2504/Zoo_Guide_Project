import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: resolve(__dirname, '..'),
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, '../index.html'),
        admin: resolve(__dirname, '../admin.html'),
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
