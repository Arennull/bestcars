/**
 * Configuración principal de Express
 * Monta middlewares, rutas y manejadores de errores
 */

import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import routes from '../routes/index.js';
import { errorHandler, notFoundHandler } from '../middleware/errorHandler.js';

dotenv.config();

const app: Express = express();

// Seguridad: cabeceras HTTP
app.use(helmet({ contentSecurityPolicy: false }));

// CORS: en desarrollo acepta cualquier localhost (Vite usa puertos variables). En producción usa CORS_ORIGINS.
const corsOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const isDev = process.env.NODE_ENV !== 'production';

app.use(
  cors({
    origin: isDev
      ? (origin: string | undefined, cb: (err: Error | null, allow?: boolean) => void) => {
          if (!origin || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
            cb(null, true);
          } else {
            cb(null, corsOrigins.includes(origin));
          }
        }
      : corsOrigins.length > 0
        ? corsOrigins
        : true,
    credentials: true,
  })
);

// Rate limiting general API: 150 req/15min
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 150,
    message: { error: 'Demasiadas peticiones. Intenta más tarde.' },
    standardHeaders: true,
    legacyHeaders: false,
  })
);


// Parser de JSON para req.body
app.use(express.json({ limit: '1mb' }));

// Raíz: mensaje informativo (evita 404 al abrir la URL en el navegador)
app.get('/', (_req, res) => {
  res.json({
    name: 'BestCars API',
    version: '1.0.0',
    docs: '/api',
    health: '/api/health',
    ready: '/api/health/ready',
  });
});

// Logging de requests en desarrollo
if (process.env.NODE_ENV === 'development') {
  app.use((req, _res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Rutas API bajo el prefijo /api
app.use('/api', routes);

// 404: ruta no encontrada
app.use(notFoundHandler);

// Manejador global de errores (debe ir último)
app.use(errorHandler);

export default app;
