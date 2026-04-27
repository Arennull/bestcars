/**
 * QA de variables de entorno del backend (sin imprimir secretos).
 * Carga .env desde la raíz del proyecto (Bestcars_Back_DEF).
 *
 * Uso: npx tsx scripts/qa-env-check.ts
 *      npm run qa:env
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

/** Misma lógica que src/index.ts: pooler 6543 requiere pgbouncer=true para Prisma */
function ensurePgbouncerParam(): void {
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl && dbUrl.includes(':6543/') && !dbUrl.includes('pgbouncer')) {
    process.env.DATABASE_URL = dbUrl.includes('?') ? `${dbUrl}&pgbouncer=true` : `${dbUrl}?pgbouncer=true`;
  }
}

const ok = (msg: string) => console.log(`  [OK] ${msg}`);
const warn = (msg: string) => console.log(`  [WARN] ${msg}`);
const fail = (msg: string) => console.log(`  [FAIL] ${msg}`);

function present(_name: string, value: string | undefined): boolean {
  return Boolean(value?.trim());
}

function maskUrl(url: string): string {
  try {
    const u = new URL(url);
    if (u.password) u.password = '***';
    if (u.username) u.username = '***';
    return u.toString();
  } catch {
    return '(URL no parseable)';
  }
}

async function testDatabase(): Promise<boolean> {
  ensurePgbouncerParam();
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return false;
  console.log('\n--- Conexión Prisma (SELECT 1) ---');
  console.log(`  DATABASE_URL (mascarado): ${maskUrl(url)}`);
  const prisma = new PrismaClient();
  try {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout 5s')), 5000)
    );
    await Promise.race([prisma.$queryRaw`SELECT 1 as ok`, timeout]);
    ok('Base de datos responde');
    return true;
  } catch (e) {
    fail(e instanceof Error ? e.message : String(e));
    return false;
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
}

async function testSupabaseClient(): Promise<boolean> {
  console.log('\n--- Cliente Supabase (solo init, sin subir) ---');
  try {
    const { getSupabaseAdmin } = await import('../src/config/supabase.js');
    getSupabaseAdmin();
    ok('SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY válidos para el SDK');
    return true;
  } catch (e) {
    fail(e instanceof Error ? e.message : String(e));
    return false;
  }
}

async function run(): Promise<number> {
  console.log('=== QA variables de entorno (Bestcars_Back_DEF) ===\n');
  let errors = 0;

  if (present('JWT_SECRET', process.env.JWT_SECRET)) {
    const len = process.env.JWT_SECRET!.length;
    if (len < 24) {
      warn(`JWT_SECRET tiene ${len} caracteres; en producción conviene >= 32`);
    } else ok('JWT_SECRET definido');
  } else {
    fail('JWT_SECRET ausente');
    errors++;
  }

  if (present('NODE_ENV', process.env.NODE_ENV)) {
    ok(`NODE_ENV=${process.env.NODE_ENV}`);
  } else {
    warn('NODE_ENV no definido');
  }

  if (present('ADMIN_USERNAME', process.env.ADMIN_USERNAME)) ok('ADMIN_USERNAME definido');
  else warn('ADMIN_USERNAME ausente (default del código)');
  if (present('ADMIN_PASSWORD', process.env.ADMIN_PASSWORD)) ok('ADMIN_PASSWORD definido');
  else warn('ADMIN_PASSWORD ausente (default del código)');

  if (present('DATABASE_URL', process.env.DATABASE_URL)) {
    const u = process.env.DATABASE_URL!;
    if (u.includes(':6543')) ok('DATABASE_URL usa pooler 6543');
    else if (u.includes(':5432')) ok('DATABASE_URL usa puerto 5432');
    else ok('DATABASE_URL definido');
  } else {
    fail('DATABASE_URL ausente');
    errors++;
  }

  const cors = process.env.CORS_ORIGINS?.trim() ?? '';
  if (cors) {
    const origins = cors.split(',').map((s) => s.trim()).filter(Boolean);
    ok(`CORS_ORIGINS: ${origins.length} origen(es)`);
    origins.forEach((o) => console.log(`       - ${o}`));
  } else {
    warn('CORS_ORIGINS vacío');
  }

  if (present('SENDGRID_API_KEY', process.env.SENDGRID_API_KEY)) {
    const k = process.env.SENDGRID_API_KEY!;
    if (k.startsWith('SG.')) ok('SENDGRID_API_KEY presente (prefijo SG.)');
    else warn('SENDGRID_API_KEY formato no típico');
  } else {
    warn('SENDGRID_API_KEY ausente');
  }
  if (present('FROM_EMAIL', process.env.FROM_EMAIL)) ok('FROM_EMAIL definido');
  else warn('FROM_EMAIL ausente');
  if (present('RECIPIENT_EMAIL', process.env.RECIPIENT_EMAIL)) ok('RECIPIENT_EMAIL definido');
  else warn('RECIPIENT_EMAIL ausente');

  if (present('SUPABASE_URL', process.env.SUPABASE_URL)) ok('SUPABASE_URL definido');
  else {
    fail('SUPABASE_URL ausente (upload-image fallará)');
    errors++;
  }
  if (present('SUPABASE_SERVICE_ROLE_KEY', process.env.SUPABASE_SERVICE_ROLE_KEY)) {
    ok('SUPABASE_SERVICE_ROLE_KEY definido');
  } else {
    fail('SUPABASE_SERVICE_ROLE_KEY ausente');
    errors++;
  }
  const bucket = process.env.SUPABASE_STORAGE_BUCKET?.trim() || 'vehicle-images';
  ok(`Bucket Storage: "${bucket}"`);

  let dbOk = true;
  let sbOk = true;
  if (process.env.DATABASE_URL?.trim()) {
    dbOk = await testDatabase();
    if (!dbOk) errors++;
  }
  if (process.env.SUPABASE_URL?.trim() && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    sbOk = await testSupabaseClient();
    if (!sbOk) errors++;
  }

  console.log('\n--- Resumen ---');
  if (errors === 0 && dbOk && sbOk) {
    console.log('Resultado: OK. Comprueba GET /api/health y /api/health/ready en el host real de la API.');
  } else {
    console.log(`Resultado: ${errors} fallo(s). Revisa FAIL arriba.`);
  }
  return errors === 0 && dbOk && sbOk ? 0 : 1;
}

run()
  .then((code) => process.exit(code))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
