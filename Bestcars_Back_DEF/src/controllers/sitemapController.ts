/**
 * Controlador del sitemap XML dinámico
 * Incluye URLs estáticas + fichas de vehículos activos (available, reserved)
 */

import { type Request, type Response } from 'express';
import { prisma } from '../config/database.js';
import { getInMemoryVehicles } from './vehicleController.js';

const useDatabase = Boolean(process.env.DATABASE_URL);
const BASE_URL = 'https://bestcarsiberica.com';
const CACHE_MAX_AGE_SEC = 3600; // 1 hora

let cachedXml: string | null = null;
let cachedAt = 0;

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatLastmod(date: Date): string {
  return date.toISOString().split('T')[0];
}

async function getVehicleIdsAndDates(): Promise<{ id: string; updatedAt: Date }[]> {
  if (useDatabase) {
    const vehicles = await prisma.vehicle.findMany({
      where: { status: { in: ['available', 'reserved'] } },
      select: { id: true, updatedAt: true },
    });
    return vehicles;
  }
  const vehicles = getInMemoryVehicles().filter(
    (v) => (v.status ?? 'available') !== 'sold'
  );
  return vehicles.map((v) => ({
    id: v.id,
    updatedAt: v.updatedAt instanceof Date ? v.updatedAt : new Date(v.updatedAt),
  }));
}

function buildSitemapXml(vehicles: { id: string; updatedAt: Date }[]): string {
  const staticUrls = [
    { loc: `${BASE_URL}`, priority: '1.0', changefreq: 'weekly' },
    { loc: `${BASE_URL}/garage`, priority: '0.9', changefreq: 'daily' },
    { loc: `${BASE_URL}/experiencia`, priority: '0.7', changefreq: 'monthly' },
    { loc: `${BASE_URL}/terminos`, priority: '0.3', changefreq: 'yearly' },
    { loc: `${BASE_URL}/privacidad`, priority: '0.3', changefreq: 'yearly' },
  ];

  const lines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];

  for (const u of staticUrls) {
    lines.push('  <url>');
    lines.push(`    <loc>${escapeXml(u.loc)}</loc>`);
    lines.push(`    <priority>${u.priority}</priority>`);
    lines.push(`    <changefreq>${u.changefreq}</changefreq>`);
    lines.push('  </url>');
  }

  for (const v of vehicles) {
    const loc = `${BASE_URL}/vehicle/${v.id}`;
    const lastmod = formatLastmod(v.updatedAt);
    lines.push('  <url>');
    lines.push(`    <loc>${escapeXml(loc)}</loc>`);
    lines.push(`    <lastmod>${lastmod}</lastmod>`);
    lines.push('    <priority>0.8</priority>');
    lines.push('    <changefreq>weekly</changefreq>');
    lines.push('  </url>');
  }

  lines.push('</urlset>');
  return lines.join('\n');
}

/**
 * GET /api/sitemap o GET /sitemap.xml
 * Genera sitemap XML dinámico con URLs estáticas + vehículos activos.
 * Cache: 1 hora.
 */
export const getSitemap = async (_req: Request, res: Response): Promise<void> => {
  try {
    const now = Date.now();
    if (cachedXml && now - cachedAt < CACHE_MAX_AGE_SEC * 1000) {
      res.set('Content-Type', 'application/xml');
      res.set('Cache-Control', `public, max-age=${CACHE_MAX_AGE_SEC}`);
      res.send(cachedXml);
      return;
    }

    const vehicles = await getVehicleIdsAndDates();
    cachedXml = buildSitemapXml(vehicles);
    cachedAt = now;

    res.set('Content-Type', 'application/xml');
    res.set('Cache-Control', `public, max-age=${CACHE_MAX_AGE_SEC}`);
    res.send(cachedXml);
  } catch (error) {
    console.error('[sitemapController] Error:', error);
    res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><error>Failed to generate sitemap</error>');
  }
};
