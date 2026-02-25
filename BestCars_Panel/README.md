# BestCars Ibérica — Panel de administración

Panel interno para gestionar **Stock**, **Leads**, **Estadísticas** y **Editor de escenas** (composición del garaje en la web).

- **Tecnología:** Vite + React
- **Requisitos:** Node.js 18+ (recomendado 20 LTS), npm

---

## Arranque rápido

```bash
npm install
npm run dev
```

Abre la URL que muestre Vite (p. ej. http://localhost:5173).

---

## Modo demo vs modo API

| Configuración | Comportamiento |
|---------------|----------------|
| **Sin `VITE_API_URL`** | Modo demo: datos locales en `localStorage`. No hace falta backend. |
| **Con `VITE_API_URL`** | Modo API: login contra el backend, vehículos/leads/escenas desde la API. |

### Variables de entorno

Crear `.env` en la raíz (o copiar desde `.env.example`):

```env
# Desarrollo
VITE_API_URL=http://localhost:3001

# Producción (sustituir por tu URL del API)
# VITE_API_URL=https://api.tudominio.com
```

Ver `.env.production.example` para despliegue.

---

## Credenciales del panel

Cuando el panel está en **modo API**, el login se valida contra el backend:

- **Usuario / contraseña por defecto (Bestcars_Back_DEF):** `admin` / `admin`
- En producción deben configurarse en el backend (`ADMIN_USERNAME`, `ADMIN_PASSWORD`); no usar `admin`/`admin` en producción.

---

## Build y despliegue

```bash
npm run build
```

La carpeta **`dist/`** se puede servir con cualquier servidor estático (Nginx, Vercel, Netlify, etc.).

```bash
npm run serve
```

Sirve `dist/` en local (p. ej. puerto 5174) para probar el build.

---

## Estructura del proyecto

| Ruta | Descripción |
|------|-------------|
| `src/main.tsx` | Punto de entrada |
| `src/app/App.tsx` | Orquestación, rutas y modales |
| `src/app/components/*` | Secciones (Stock, Leads, Estadísticas, Escenas, etc.) |
| `src/app/data/mock-data.ts` | Tipos y datos de ejemplo |
| `src/app/hooks/use-local-storage-state.ts` | Persistencia en `localStorage` (modo demo) |
| `src/contexts/AuthContext.tsx` | Autenticación (modo API) |
| `src/services/api.ts` | Cliente HTTP contra el backend |
| `src/adapters/*` | Transformación API ↔ formato del panel |

---

## Funcionalidades principales

- **Stock:** listado, edición y orden de vehículos (con API o demo).
- **Leads:** contactos y solicitudes de prueba de manejo.
- **Estadísticas:** vistas y métricas.
- **Escenas:** editor visual para posicionar vehículos en el garaje; vista previa en vivo (iframe). Con API, las escenas se guardan en el backend; con Bestcars_Back_DEF solo lectura (lista vacía).

Los datos en modo demo se guardan en `localStorage` y persisten al recargar.
