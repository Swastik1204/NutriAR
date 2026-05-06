import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
import react from '@vitejs/plugin-react';

const useHttps = process.env.USE_HTTPS === 'true';

export default defineConfig({
  plugins: [useHttps ? basicSsl() : null, react()].filter(Boolean),
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('three') || id.includes('@react-three/fiber') || id.includes('@react-three/drei') || id.includes('@react-spring/three')) {
              return 'three-vendor';
            }
            if (id.includes('@tensorflow')) {
              return 'tensorflow-vendor';
            }
            if (id.includes('quagga')) {
              return 'scanner-vendor';
            }
            if (id.includes('firebase')) {
              return 'firebase-vendor';
            }
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            return 'vendor';
          }
        }
      }
    }
  }
});
