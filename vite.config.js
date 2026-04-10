import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import wasm from 'vite-plugin-wasm'
import { existsSync } from 'fs'
import { resolve } from 'path'

const contractPath = resolve('./contracts/managed/alpha-vault/contract/index.js');
const contractAlias = existsSync(contractPath)
  ? contractPath
  : resolve('./src/contract/contract-stub.js');

export default defineConfig({
  plugins: [wasm(), react()],

  define: {
    // Make Buffer available globally in browser bundles
    global: 'globalThis',
  },

  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
    hmr: true,
  },

  resolve: {
    alias: {
      'alpha-vault-contract': contractAlias,
      'cross-fetch': resolve('./src/contract/cross-fetch-shim.js'),
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
    exclude: ['@midnight-ntwrk/midnight-js-fetch-zk-config-provider'],
  },
})
