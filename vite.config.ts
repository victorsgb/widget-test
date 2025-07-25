import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': '{}', // evita referências a process.env.FOO falharem
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    lib: {
      entry: 'src/main.tsx',
      name: 'MyWidget',
      fileName: 'widget.bundle',
      formats: ['iife'],
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
