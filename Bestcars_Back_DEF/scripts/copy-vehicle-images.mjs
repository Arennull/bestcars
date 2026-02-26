/**
 * Copia las imágenes de vehículos desde Bestcars_front_DEF/src/assets/car-*
 * a public/vehicle-images con el nombre que espera la API (ej. AUDI RS6_42.jpg).
 * Ejecutar desde la raíz del backend: node scripts/copy-vehicle-images.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backRoot = path.resolve(__dirname, '..');
const frontAssets = path.join(backRoot, '..', 'Bestcars_front_DEF', 'src', 'assets');
const outDir = path.join(backRoot, 'public', 'vehicle-images');

if (!fs.existsSync(frontAssets)) {
  console.warn('No se encontró Bestcars_front_DEF/src/assets. Saltando copia de imágenes.');
  process.exit(0);
}

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

let copied = 0;
const dirs = fs.readdirSync(frontAssets, { withFileTypes: true }).filter((d) => d.isDirectory() && d.name.startsWith('car-'));
for (const dir of dirs) {
  const dirPath = path.join(frontAssets, dir.name);
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const src = path.join(dirPath, file);
    if (!fs.statSync(src).isFile()) continue;
    const outName = file.replace(/\.jpg\.jpg$/i, '.jpg');
    const dest = path.join(outDir, outName);
    fs.copyFileSync(src, dest);
    copied++;
  }
}
console.log(`Copiadas ${copied} imágenes a public/vehicle-images`);
