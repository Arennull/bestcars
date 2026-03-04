# Prefetch de datos de vehículo

## Objetivo

Navegación instantánea a la ficha de vehículo al hacer clic, sin estado de loading visible, prefetcheando los datos al hacer hover (desktop) o touch (móvil).

## Implementación

### 1. Caché en memoria (`src/services/vehicleCache.ts`)

- Map con máximo 10 entradas (LRU).
- `getCachedVehicle(id)`, `setCachedVehicle(vehicle)`, `hasCachedVehicle(id)`.

### 2. API prefetch (`src/services/api.ts`)

- `api.prefetchVehicle(id)`: fetch silencioso, guarda en caché. No afecta la UI.

### 3. Hook `usePrefetchVehicle` (`src/hooks/usePrefetchVehicle.ts`)

- Debounce de 180 ms para evitar fetches innecesarios.
- `prefetch(id)`, `cancel()` (al salir del hover).

### 4. Componentes modificados

| Componente | Cambios |
|------------|---------|
| **StockMenu** | `onMouseEnter`, `onMouseLeave`, `onTouchStart` en cada card de vehículo |
| **CarHotspots** | Idem en cada Link (Home) |
| **SceneHotspots** | Idem en cada Link (Experiencia) |
| **VehicleDetailPage** | Comprueba caché antes de fetch; si hay hit, muestra ficha sin loading |

### 5. Flujo

1. Usuario hace hover/touch sobre un vehículo → tras 180 ms se ejecuta prefetch.
2. Usuario hace clic → navega a `/vehicle/:id`.
3. VehicleDetailPage monta → useEffect comprueba caché.
4. Si hay hit: `setVehicle(cached)`, `setLoading(false)` → render inmediato sin skeleton.
5. Si no hay hit: fetch normal como antes.

---

## React Router 7: loader + prefetch nativo

### Ventajas

- Integrado en el router: `loader` + `prefetch="intent"` en `<Link>`.
- Menos código propio.
- Caché gestionado por el framework.
- Prefetch automático al hover/focus.

### Desventajas

- Requiere migrar de `BrowserRouter` a `createBrowserRouter` con `RouterProvider`.
- Las rutas deben definirse con `loader` en el `Route`.
- El componente recibe datos vía `useLoaderData()` en lugar de `useState` + `useEffect`.
- Más cambios estructurales en el proyecto.

### Ejemplo (si se migrara)

```tsx
// App con createBrowserRouter
const router = createBrowserRouter([
  {
    path: '/vehicle/:id',
    element: <VehicleDetailPage />,
    loader: async ({ params }) => {
      const cached = getCachedVehicle(params.id!);
      if (cached) return cached;
      const data = await api.getVehicleById(params.id!);
      setCachedVehicle(data);
      return data;
    },
  },
  // ...
]);

// Link con prefetch
<Link to={`/vehicle/${id}`} prefetch="intent">...</Link>
```

### Conclusión

La solución manual sigue siendo la más adecuada porque:

1. No requiere cambiar la arquitectura de rutas.
2. El caché se controla explícitamente (LRU, 10 entradas).
3. El debounce es configurable.
4. Se integra bien con el código actual.
