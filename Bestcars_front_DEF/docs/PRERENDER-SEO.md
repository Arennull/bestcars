# Prerender para SEO (SPA)

## Problema

La web es una SPA con Client-Side Rendering. Los crawlers que no ejecutan JavaScript (Bing, redes sociales) reciben HTML vacío: solo `<div id="root">` y los meta de `index.html`.

## Solución implementada: prerender post-build

Se añadió un script que, tras el build de Vite:

1. Sirve `dist/` con `serve`
2. Usa Puppeteer para visitar cada ruta
3. Espera a que React renderice
4. Guarda el HTML completo en archivos estáticos

### Rutas prerenderizadas

- `/` (Home)
- `/garage`
- `/experiencia`
- `/terminos`
- `/privacidad`

**No incluidas:** `/vehicle/:id` (dinámicas), `/scene-preview` (Disallow en robots.txt)

### Comandos

```bash
# Build normal (sin prerender)
npm run build

# Build + prerender (HTML con contenido para crawlers)
npm run build:prerender
```

### Requisitos

1. **Backend API en marcha** durante el prerender: Home, Garage y Experiencia cargan datos de la API. Si la API no responde, esas páginas pueden quedar en loading.
2. **Puppeteer**: se instala con `vite-plugin-prerender` o se puede añadir como devDependency.
3. **`serve`**: ya está en el proyecto.

### Despliegue

En CI/CD, ejecutar `npm run build:prerender` en lugar de `npm run build`. Asegurarse de que la API esté accesible (por ejemplo, apuntando a staging/producción con `VITE_API_URL`).

### Hosting estático

El host debe servir el HTML correcto por ruta:

- `/` → `index.html`
- `/garage` → `garage/index.html`
- `/terminos` → `terminos/index.html`
- etc.

Netlify, Vercel, GitHub Pages y similares ya lo hacen con esta estructura.

### Alternativas futuras

- **Rutas dinámicas** (`/vehicle/:id`): prerender con lista de IDs desde el sitemap o la API.
- **Opción B (middleware backend)**: detectar bots y servir HTML prerenderizado con Puppeteer en tiempo real.
- **SSR (Next.js / Vite SSR)**: migración más costosa, pero solución definitiva.
