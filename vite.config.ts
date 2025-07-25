import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    host: '0.0.0.0',
    port: 5004,
    // allowedHosts: [
    //   'monitdb-dev.ddns.net',
    //   '127c-187-19-224-237.ngrok-free.app'
    // ],
    strictPort: true,
    hmr: {
      clientPort: 5004
    }
  }
});
