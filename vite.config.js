import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },

  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Three.js — largest chunk, isolated
          if (id.includes('three') || id.includes('@react-three')) return 'three-vendor';
          // Charts
          if (id.includes('recharts') || id.includes('d3-')) return 'chart-vendor';
          // React core
          if (id.includes('react-dom') || id.includes('react-router')) return 'react-vendor';
          // Lucide icons
          if (id.includes('lucide-react')) return 'icons';
        },
      },
    },
    // Minify with esbuild (default, fastest)
    minify: 'esbuild',
    // Reduce CSS output
    cssMinify: true,
    // Source maps off in prod
    sourcemap: false,
  },

  // Pre-bundle heavy deps for faster dev server startup
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'recharts', 'lucide-react'],
  },
})
