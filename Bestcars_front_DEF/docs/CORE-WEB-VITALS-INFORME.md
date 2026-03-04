# Informe SEO Técnico — Core Web Vitals

**Proyecto:** BestCars Ibérica Frontend  
**Fecha:** 4 de marzo de 2025  
**Stack:** React 18 + Vite 6 + Tailwind CSS 4 (SPA con CSR)

---

## Resumen ejecutivo

Se ha realizado una auditoría de Core Web Vitals (LCP, CLS, INP) y se han aplicado mejoras rápidas en el frontend público. El code splitting por ruta ya estaba implementado; se han añadido optimizaciones para LCP y CLS.

---

## 1. LCP (Largest Contentful Paint)

### Elemento LCP identificado

- **Home:** Imagen hero `Bestcars-home.png` (casa con iluminación arquitectónica)
- **Ubicación:** `src/app/pages/HomePage.tsx`, dentro de `.image-wrapper`

### Problemas detectados

| Problema | Estado |
|----------|--------|
| Sin preload de la imagen crítica | ❌ Corregido |
| Atributos `fetchpriority` / `loading` | ✅ Ya presentes |
| CSS/JS bloqueante | ⚠️ CSS principal bloquea; aceptable para SPA |

### Correcciones aplicadas

1. **Preload en `index.html`**  
   - Plugin Vite `preloadHeroImagePostBuild()` que inyecta tras el build:
   ```html
   <link rel="preload" as="image" href="/assets/Bestcars-home-[hash].png" fetchpriority="high">
   ```
   - El hash se resuelve automáticamente en cada build.

2. **Atributos en la imagen hero**  
   - `loading="eager"` — ya presente  
   - `fetchPriority="high"` — corregido a camelCase (React)  
   - `decoding="async"` — ya presente  

3. **Dimensiones intrínsecas**  
   - Añadidos `width={5803}` y `height={3264}` para reservar espacio y evitar CLS.

---

## 2. CLS (Cumulative Layout Shift)

### Problemas detectados

| Elemento | Problema | Corrección |
|----------|----------|------------|
| Imagen hero Home | Sin width/height | `width={5803}` `height={3264}` |
| Logo Header | Sin dimensiones | `width={180}` `height={56}` |
| Logo Garage | Sin dimensiones | `width={120}` `height={120}` |
| Thumbnails StockMenu | Sin dimensiones | `width={56}` `height={56}` |
| Imágenes HeroGallery | Sin aspect-ratio | `style={{ aspectRatio: '3/2' }}` y `'2/3'` |
| Fuentes Google | Carga tardía / FOUT | `font-display: swap` ya en URL |
| Preconnect fuentes | No había | Añadido en `index.html` |

### Correcciones aplicadas

1. **`index.html`** — Preconnect para fuentes:
   ```html
   <link rel="preconnect" href="https://fonts.googleapis.com" />
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
   ```

2. **`fonts.css`** — Ya incluye `display=swap` en la URL de Google Fonts.

3. **Imágenes** — Dimensiones explícitas o `aspect-ratio` en todos los `<img>` relevantes.

4. **Elementos dinámicos** — StockMenu, TermsAndConditions y modales usan `position: fixed` o `absolute`, por lo que no desplazan el layout principal.

---

## 3. INP (Interaction to Next Paint)

### Revisión de handlers

| Componente | Handler | Evaluación |
|------------|---------|------------|
| Header | `onClick={() => navigate('/')}` | ✅ Ligero |
| StockMenu | `handleSelectCar` → `navigate()` | ✅ Ligero |
| HeroGallery | `handleFullscreen` / `handleCloseFullscreen` | ✅ Ligero |
| QuizForm | `onClick` varios | ✅ Ligero |
| Carousel, Tabs | `onClick` | ✅ Ligero |

No se han detectado handlers costosos que bloqueen el hilo principal de forma significativa.

### Transiciones de ruta

- Rutas con `React.lazy()` + `Suspense` y fallback `<PageLoader />`.
- La navegación es fluida; el posible retraso viene del chunk lazy, no del handler.

### Recomendaciones futuras (opcionales)

- Prefetch de `VehicleDetailPage` al hacer hover sobre un vehículo en StockMenu.
- Uso de `startTransition` en actualizaciones de estado no urgentes si se detectan cuellos de botella.

---

## 4. General — Code splitting y build

### Code splitting

- Implementado en `App.tsx` con `React.lazy()` y `Suspense`.
- Rutas lazy: HomePage, GaragePage, VehicleDetailPage, ScenePreviewPage, DynamicScenePage, NotFoundPage, TermsPage, PrivacyPage.
- Footer y Toaster se cargan de forma eager (peso bajo).

### Build de producción

- **Tree shaking:** Activado por defecto (Rollup).
- **Minificación:** Activada (esbuild).
- **Chunks:** Separados por ruta (p. ej. `HomePage-DFZCmY-O.js`, `VehicleDetailPage-Dsh14zha.js`).

---

## Archivos modificados

| Archivo | Cambios |
|---------|---------|
| `index.html` | Preconnect para fuentes |
| `vite.config.ts` | Plugin `preloadHeroImagePostBuild()` |
| `src/app/pages/HomePage.tsx` | `width`/`height`, `fetchPriority` |
| `src/app/components/Header.tsx` | `width`/`height` en logo |
| `src/app/components/HeroGallery.tsx` | `aspect-ratio` en imágenes |
| `src/app/components/StockMenu.tsx` | `width`/`height` en thumbnails |
| `src/app/pages/GaragePage.tsx` | `width`/`height`, `fetchPriority` en logo |

---

## Verificación

```bash
npm run build
```

El build genera `dist/index.html` con el preload inyectado:

```html
<link rel="preload" as="image" href="/assets/Bestcars-home-BP_G_6PI.png" fetchpriority="high">
```

---

## Próximos pasos sugeridos

1. Medir con Lighthouse / PageSpeed Insights tras el despliegue.
2. Considerar WebP/AVIF para la imagen hero si el peso sigue siendo alto.
3. Evaluar prefetch de rutas críticas (p. ej. `/vehicle/:id`) en hover.
4. Revisar tamaño del CSS principal (index-*.css ~115 KB gzip) si se prioriza LCP.
