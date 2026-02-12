import { PrismaClient } from '@prisma/client';

// Single Prisma instance for the whole app
export const prisma = new PrismaClient();
