import { type Request, type Response } from 'express';
import { prisma } from '../config/prisma.js';


export const healthCheck = async (_req: Request, res: Response): Promise<void> => {
  let db = 'unknown';
  try {
    await prisma.$queryRaw`SELECT 1`;
    db = 'ok';
  } catch {
    db = 'error';
  }

  res.json({
    status: 'ok',
    message: 'Best Cars API is running',
    db,
    timestamp: new Date().toISOString(),
  });
};
