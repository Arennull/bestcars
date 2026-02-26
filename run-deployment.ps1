# Ejecutar todo en modo deployment (build + instrucciones para backend, web, panel)
# Ejecutar desde la raíz del proyecto: .\run-deployment.ps1

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

Write-Host "=== 1. Build de todos los proyectos ===" -ForegroundColor Cyan
& "$root\build-all.ps1"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "`n=== 2. Arrancar Backend (Bestcars_Back_DEF) ===" -ForegroundColor Cyan
Write-Host "En una terminal nueva ejecuta:" -ForegroundColor Yellow
Write-Host "  cd `"$root\Bestcars_Back_DEF`"; npm start" -ForegroundColor White
Write-Host "  (Backend quedara en http://localhost:3001)" -ForegroundColor Gray
Write-Host ""

Write-Host "=== 3. Arrancar Web (Bestcars_front_DEF) ===" -ForegroundColor Cyan
Write-Host "En otra terminal:" -ForegroundColor Yellow
Write-Host "  cd `"$root\Bestcars_front_DEF`"; npm run serve" -ForegroundColor White
Write-Host "  (Web en http://localhost:5173)" -ForegroundColor Gray
Write-Host ""

Write-Host "=== 4. Arrancar Panel (BestCars_Panel) ===" -ForegroundColor Cyan
Write-Host "En otra terminal:" -ForegroundColor Yellow
Write-Host "  cd `"$root\BestCars_Panel`"; npm run serve" -ForegroundColor White
Write-Host "  (Panel en http://localhost:5174)" -ForegroundColor Gray
Write-Host ""

Write-Host "=== Resumen ===" -ForegroundColor Green
Write-Host "  API:    http://localhost:3001  (GET /api/health para probar)"
Write-Host "  Web:    http://localhost:5173"
Write-Host "  Panel:  http://localhost:5174  (login: admin / admin)"
Write-Host ""
Write-Host "Si el puerto 3001 esta ocupado, cierra el proceso que lo use o cambia PORT en Bestcars_Back_DEF\.env"
