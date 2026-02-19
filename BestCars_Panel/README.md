# BestCars Ibérica — Panel de control (Vite + React)

Panel interno para gestionar **Stock**, **Leads**, **Estadísticas**, **Registro de actividad** y **Vista Web**.

## Requisitos

- Node.js 18+ (recomendado 20 LTS)
- npm (incluido con Node)

## Arranque rápido

```bash
npm ci
npm run dev
```

Luego abre la URL que te indique Vite.

## Estructura del proyecto

- `src/main.tsx`: entrypoint.
- `src/app/App.tsx`: orquestación del panel (estado principal, navegación y modales).
- `src/app/components/*`: componentes de UI y secciones.
- `src/app/data/mock-data.ts`: tipos + datos de ejemplo.

## Persistencia

Los datos se guardan en `localStorage` mediante el hook:

- `src/app/hooks/use-local-storage-state.ts`

Ejecución en desarrollo:

npm run dev

Vite mostrará en consola la URL local (por defecto http://localhost:5173).

Estructura del proyecto

src/main.tsx: punto de entrada.

src/app/App.tsx: orquestación principal (estado, navegación y modales).

src/app/components/*: componentes de UI y secciones.

src/app/data/mock-data.ts: tipos y datos de ejemplo.

src/app/hooks/use-local-storage-state.ts: persistencia en localStorage.

Persistencia

Los datos se guardan en localStorage mediante el hook:

src/app/hooks/use-local-storage-state.ts

De este modo, los cambios se mantienen aunque se recargue la página.

Funcionalidades principales
Stock / Leads / Estadísticas

Secciones operativas del panel para la gestión y seguimiento interno.

Escenas (Editor Visual)

Se incorpora una nueva sección “Escenas” orientada a la edición visual y previsualización en vivo.

Incluye:

Creación de escenas desde cero:

Nombre de la escena

URL de fondo

Selector de escenas

Selector de posiciones:

Parking 1, Parking 2, Parking 3, Parking 4

Rampa

Gestión por posición:

Vehículo asignado

Transformación: x, y, escala, rotación

Indicadores de estado: ocupada / vacía

Acciones: Guardar / Restablecer por posición

Gestión por escena:

Guardar / Restablecer fondo por escena

Vista web embebida (iframe) y sincronización en vivo

Integración de la vista web dentro del panel mediante iframe.

Sincronización en vivo mediante postMessage para reflejar cambios del editor en tiempo real.

Cambios relevantes (ZIP)

Nueva sección en el menú: “Escenas” (Editor Visual).

Eliminación total del apartado de logs:

Eliminado del menú.

Eliminado de App.tsx.

Eliminados ActivityLog y mockActivityLogs del mock.

Eliminado activity-logs-section.tsx.

Implementación del editor de escenas y sincronización en vivo mediante iframe + postMessage.
