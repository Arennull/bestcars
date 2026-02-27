/**
 * Pruebas manuales para parsePrice (misma lógica que vehicleAdapter.parsePrice).
 * Ejecutar: node scripts/test-parse-price.mjs
 */
function parsePrice(priceStr) {
  if (typeof priceStr !== 'string') return 0;
  let s = priceStr.trim().replace(/€/g, '').replace(/\s/g, '');
  s = s.replace(/\./g, '').replace(',', '.');
  const num = parseFloat(s);
  return Number.isNaN(num) ? 0 : num;
}

const cases = [
  ['€125.000', 125000],
  ['€125.000,00', 125000],
  ['125000', 125000],
  [' 125.000 ', 125000],
  ['€ 125.000,50', 125000.5],
  ['', 0],
  ['abc', 0],
];

let ok = 0;
for (const [input, expected] of cases) {
  const got = parsePrice(input);
  if (got === expected) {
    ok++;
    console.log(`  OK: parsePrice(${JSON.stringify(input)}) === ${got}`);
  } else {
    console.error(`  FAIL: parsePrice(${JSON.stringify(input)}) got ${got}, expected ${expected}`);
  }
}
console.log(ok === cases.length ? `\nparsePrice: ${ok}/${cases.length} passed.\n` : `\nparsePrice: ${ok}/${cases.length} passed.\n`);
process.exit(ok === cases.length ? 0 : 1);
