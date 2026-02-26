/**
 * Controlador de health check
 * Liveness: API activa. Readiness: API + DB (para Railway/load balancers).
 */

import { type Request, type Response } from 'express';
import { prisma } from '../config/database.js';

const useDatabase = Boolean(process.env.DATABASE_URL);

/**
 * GET /api/health - Liveness: la API responde
 */
export const healthCheck = (_req: Request, res: Response): void => {
  res.json({
    status: 'ok',
    message: 'Best Cars API is running',
    timestamp: new Date().toISOString(),
    database: useDatabase ? 'configured' : 'none',
  });
};

/**
 * GET /api/health/ready - Readiness: API + conexión a DB (Railway, K8s)
 */
export const healthReady = async (_req: Request, res: Response): Promise<void> => {
  try {
    if (useDatabase) {
      await prisma.$queryRaw`SELECT 1`;
    }
    res.json({
      status: 'ok',
      ready: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[health] Readiness check failed:', error);
    res.status(503).json({
      status: 'error',
      ready: false,
      error: 'Database unavailable',
      timestamp: new Date().toISOString(),
    });
  }
};
