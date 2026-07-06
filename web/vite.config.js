import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Relative asset URLs so the same build works at both the domain root
  // (fooddraft.payrollgm.com) and a subpath (payrollgm.com/fooddraft).
  base: './',
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:4100',
    },
  },
});
