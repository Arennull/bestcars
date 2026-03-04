#!/usr/bin/env node
/**
 * Script de prerender post-build para SEO.
 * Usa serve (ya en el proyecto) para servir dist/ y Puppeteer para capturar HTML.
 * Ejecutar después de: npm run build
 *
 * Requiere: puppeteer (viene con vite-plugin-prerender si está instalado)
 */

import { spawn } from 'child_process';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'dist');
const ROUTES = ['/', '/garage', '/experiencia', '/terminos', '/privacidad'];
const RENDER_WAIT_MS = 5000;
const PORT = 37542;

async function serveDist() {
  return new Promise((resolve, reject) => {
    const proc = spawn('npx', ['vite', 'preview', '--port', String(PORT)], {
      cwd: join(__dirname, '..'),
      stdio: 'ignore',
      shell: true,
    });
    proc.on('error', reject);
    const start = Date.now();
    const check = () => {
      fetch(`http://localhost:${PORT}`).then(() => resolve(proc)).catch(() => {
        if (Date.now() - start < 10000) setTimeout(check, 200);
        else resolve(proc);
      });
    };
    setTimeout(check, 500);
  });
}

async function prerender() {
  const puppeteer = await import('puppeteer');
  const serverProc = await serveDist();
  const base = `http://localhost:${PORT}`;

  const browser = await puppeteer.default.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  for (const route of ROUTES) {
    try {
      await page.goto(base + route, { waitUntil: 'networkidle0', timeout: 45000 });
      await page.waitForFunction(
        () => document.querySelector('#root')?.innerHTML?.length > 50,
        { timeout: 20000 }
      ).catch(() => {});
      await new Promise((r) => setTimeout(r, RENDER_WAIT_MS));
      const html = await page.content();
      const outPath = route === '/' ? join(DIST, 'index.html') : join(DIST, route.slice(1), 'index.html');
      mkdirSync(dirname(outPath), { recursive: true });
      writeFileSync(outPath, html);
      console.log(`[prerender] ${route} -> ${outPath}`);
    } catch (err) {
      console.error(`[prerender] Error en ${route}:`, err.message);
    }
  }

  await browser.close();
  serverProc?.kill?.();
  console.log('[prerender] Listo.');
}

prerender().catch((e) => {
  console.error(e);
  process.exit(1);
});
