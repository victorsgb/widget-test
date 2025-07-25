import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    lib: {
      entry: 'src/main.tsx',         // <- seu ponto de entrada React
      name: 'MyWidget',              // <- nome global (pode ser qualquer um)
      fileName: 'widget.bundle',     // <- resultado será dist/widget.bundle.js
      formats: ['iife'],             // <- necessário para uso via <script>
    },
    rollupOptions: {
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5004,
    strictPort: true,
    hmr: {
      clientPort: 5004
    }
  }
});
