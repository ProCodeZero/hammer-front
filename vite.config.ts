import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: process.env.NODE_ENV === 'development' ? 'inline' : false,
  },
  preview: {
    allowedHosts: true,
  },
});
