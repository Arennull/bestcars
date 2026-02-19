# Best Cars — Panel de Gestión

Proyecto para el concesionario **Best Cars Ibérica**. Panel de administración para gestión de stock, leads y estadísticas.

## Contenido

- **BestCars_Panel/** — Panel de gestión (React, Vite, Tailwind, Radix UI)
- **BestCars_Back-updated/** — API REST (opcional, para conectar datos reales)

## Inicio rápido — Panel (Frontend)

```bash
cd BestCars_Panel
npm install
npm run dev
```

El panel estará disponible en `http://localhost:5173`.

### Build para producción

```bash
cd BestCars_Panel
npm run build
```

Los archivos se generan en `dist/`.

## API (opcional)

Si deseas conectar el panel a la API real:

```bash
cd BestCars_Back-updated
npm install
cp .env.example .env
# Editar .env con tus credenciales
npm run db:generate
npm run db:push
npm run dev
```

Ver [BestCars_Back-updated/README.md](BestCars_Back-updated/README.md) para documentación de la API.
