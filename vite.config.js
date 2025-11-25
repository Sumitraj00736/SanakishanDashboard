import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';  // New Vite plugin

export default defineConfig({
  plugins: [react(), tailwindcss()],  // Add the plugin
    server: {
    proxy: {
      "/api": {
        target: "http://15.206.128.54:4000",
        changeOrigin: true,
        secure: false,
      }
    }
  }
});