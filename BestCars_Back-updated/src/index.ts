import 'dotenv/config';
import dotenv from 'dotenv';
import app from './config/app.js';
import { prisma } from './config/prisma.js';

dotenv.config();

const PORT = process.env.PORT || 3001;

async function start(): Promise<void> {
  try {
    await prisma.$connect();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

void start();

async function shutdown(signal: string): Promise<void> {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  try {
    await prisma.$disconnect();
  } catch {
    // ignore
  }
  process.exit(0);
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
