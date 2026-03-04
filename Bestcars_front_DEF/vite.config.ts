import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

// Nota: Se eliminó preloadHeroImagePostBuild porque en SPA el preload se inyectaba
// en todas las rutas (/, /experiencia, etc.) pero la imagen hero solo se usa en HomePage.
// En /experiencia el navegador preloadaba hero-desktop.webp sin usarla → warning.
// HomePage ya usa fetchPriority="high" y loading="eager" en el img para LCP.

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    ViteImageOptimizer({
      logStats: true,
      jpeg: { quality: 85 },
      jpg: { quality: 85 },
      png: { quality: 90 },
    }),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // Permitir acceso via dominios de túnel (Cloudflare) u otros hosts
    allowedHosts: true,
  },
})
