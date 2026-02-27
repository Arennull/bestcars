/**
 * Normaliza el precio para guardar en DB: acepta "€", "." miles, "," decimales (es-ES).
 * Devuelve string numérico limpio (ej. "125000" o "125000.00").
 */
export function normalizePrice(price: string): string {
  let s = String(price ?? '').trim().replace(/€/g, '').replace(/\s/g, '');
  s = s.replace(/\./g, ''); // separador de miles (es-ES)
  s = s.replace(',', '.');  // coma decimal a punto
  if (!/^\d*\.?\d*$/.test(s) || s === '' || s === '.') return '0';
  const num = parseFloat(s);
  return Number.isNaN(num) ? '0' : String(num);
}

/** Pruebas rápidas: ejecutar con `npx tsx src/utils/priceUtils.ts` */
function runPriceTests(): void {
  const cases: [string, string][] = [
    ['€125.000', '125000'],
    ['€125.000,00', '125000'],
    ['125000', '125000'],
    [' 125.000 ', '125000'],
    ['€ 125.000,50', '125000.5'],
    ['', '0'],
    ['abc', '0'],
  ];
  let ok = 0;
  for (const [input, expected] of cases) {
    const got = normalizePrice(input);
    if (got === expected) {
      ok++;
      console.log(`  OK: normalizePrice(${JSON.stringify(input)}) === ${JSON.stringify(got)}`);
    } else {
      console.error(`  FAIL: normalizePrice(${JSON.stringify(input)}) got ${JSON.stringify(got)}, expected ${JSON.stringify(expected)}`);
    }
  }
  console.log(ok === cases.length ? `\nPriceUtils: ${ok}/${cases.length} passed.\n` : `\nPriceUtils: ${ok}/${cases.length} passed.\n`);
  process.exit(ok === cases.length ? 0 : 1);
}

if (process.argv[1]?.includes('priceUtils')) {
  console.log('Running priceUtils tests...\n');
  runPriceTests();
}
