import { defineConfig } from 'vite'
import path from 'path'
import fs from 'fs'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

/** Inyecta preload de la imagen hero LCP tras el build para mejorar Core Web Vitals */
function preloadHeroImagePostBuild() {
  return {
    name: 'preload-hero-post',
    apply: 'build',
    closeBundle() {
      const outDir = path.resolve(process.cwd(), 'dist')
      const assetsDir = path.join(outDir, 'assets')
      const indexPath = path.join(outDir, 'index.html')
      if (!fs.existsSync(assetsDir) || !fs.existsSync(indexPath)) return
      const files = fs.readdirSync(assetsDir)
      const hero = files.find((f) => f.startsWith('Bestcars-home') && f.endsWith('.png'))
      if (!hero) return
      const preload = `    <link rel="preload" as="image" href="/assets/${hero}" fetchpriority="high">`
      let html = fs.readFileSync(indexPath, 'utf-8')
      if (html.includes(`href="/assets/${hero}"`)) return
      html = html.replace('</head>', `${preload}\n  </head>`)
      fs.writeFileSync(indexPath, html)
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    preloadHeroImagePostBuild(),
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
