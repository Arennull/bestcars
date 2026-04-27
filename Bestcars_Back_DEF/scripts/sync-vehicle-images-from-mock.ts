/**
 * Sincroniza el array `images` de cada vehículo en la BD con el catálogo mock
 * (misma lista que usa el backend en memoria), emparejando por `title` exacto.
 *
 * Útil cuando la BD solo tiene pocas imágenes y el panel muestra menos de las reales.
 *
 * Uso (desde Bestcars_Back_DEF, con DATABASE_URL):
 *   npx tsx scripts/sync-vehicle-images-from-mock.ts
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { mockVehicles } from '../src/data/mockVehicles.js';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL no está definida. Configura la URL de Supabase/Postgres y reintenta.');
    process.exit(1);
  }

  let updated = 0;
  for (const mock of mockVehicles) {
    const res = await prisma.vehicle.updateMany({
      where: { title: mock.title },
      data: { images: mock.images },
    });
    if (res.count > 0) {
      updated += res.count;
      console.log(`OK  "${mock.title}" → ${mock.images.length} imágenes (${res.count} fila(s))`);
    } else {
      console.log(`SKIP "${mock.title}" (ningún vehículo con ese título en la BD)`);
    }
  }

  console.log(`\nHecho. Filas actualizadas: ${updated}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
