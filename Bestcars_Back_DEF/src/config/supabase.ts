/**
 * Cliente Supabase con service role (solo backend).
 * Nunca exponer SUPABASE_SERVICE_ROLE_KEY al frontend.
 *
 * La URL pública de objetos (getPublicUrl) requiere bucket público en Supabase,
 * o usar URLs firmadas en un flujo futuro.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;

function requireEnv(name: string, value: string | undefined): string {
  const v = value?.trim();
  if (!v) {
    throw new Error(`${name} is required for Supabase Storage uploads`);
  }
  return v;
}

/** Cliente admin para Storage (y otros usos server-side). Lanza si faltan URL o service role key. */
export function getSupabaseAdmin(): SupabaseClient {
  if (cachedClient) return cachedClient;
  const url = requireEnv('SUPABASE_URL', process.env.SUPABASE_URL);
  const serviceRoleKey = requireEnv(
    'SUPABASE_SERVICE_ROLE_KEY',
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  cachedClient = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cachedClient;
}

/** Bucket de imágenes de vehículos; por defecto "vehicle-images". */
export function getVehicleImagesBucket(): string {
  return process.env.SUPABASE_STORAGE_BUCKET?.trim() || 'vehicle-images';
}
