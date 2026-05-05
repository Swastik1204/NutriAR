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
});
