import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite is the build tool that runs our React app during development
// and bundles it into fast static files for production.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Any request the frontend makes to /api/... gets forwarded to our
      // backend server, so we don't hit CORS issues during development.
      '/api': 'http://localhost:5000',
      '/uploads': 'http://localhost:5000',
    },
  },
});
