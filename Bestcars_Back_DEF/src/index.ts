/**
 * Punto de entrada de la aplicación Best Cars API
 * Inicia el servidor Express y configura el apagado graceful
 */

import 'dotenv/config';
import app from './config/app.js';
import { prisma } from './config/database.js';

const PORT = Number(process.env.PORT) || 3001;
const useDatabase = Boolean(process.env.DATABASE_URL);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on 0.0.0.0:${PORT}`);
  console.log(`📊 API: /api`);
  console.log(useDatabase ? '✅ Database connected (PostgreSQL)' : '⚠️  MOCK mode (no DATABASE_URL)');
});

async function shutdown(signal: string) {
  console.log(`\n${signal}. Shutting down gracefully...`);
  if (useDatabase) {
    try {
      await prisma.$disconnect();
    } catch {
      // ignore
    }
  }
  process.exit(0);
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
