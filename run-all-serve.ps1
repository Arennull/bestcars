# Arranca backend, web y panel (carpetas dist) con rutas explicitas.
# Ejecutar desde la raiz: .\run-all-serve.ps1
# Requiere: haber ejecutado antes .\build-all.ps1

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

$webDist   = Join-Path $root "Bestcars_front_DEF\dist"
$panelDist = Join-Path $root "BestCars_Panel\dist"

if (-not (Test-Path $webDist))   { Write-Host "Falta build de la web. Ejecuta .\build-all.ps1" -ForegroundColor Red; exit 1 }
if (-not (Test-Path $panelDist)) { Write-Host "Falta build del panel. Ejecuta .\build-all.ps1" -ForegroundColor Red; exit 1 }

Write-Host "Sirviendo WEB desde:   $webDist   (puerto 5173)" -ForegroundColor Cyan
Write-Host "Sirviendo PANEL desde: $panelDist (puerto 5174)" -ForegroundColor Cyan
Write-Host ""

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\Bestcars_Back_DEF'; npm start"
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npx serve '$webDist' -p 5173"
Start-Sleep -Seconds 1
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npx serve '$panelDist' -p 5174"

Write-Host "Abiertas 3 ventanas: Backend (3001), Web (5173), Panel (5174)" -ForegroundColor Green
Write-Host "  Web:   http://localhost:5173" -ForegroundColor White
Write-Host "  Panel: http://localhost:5174  (admin / admin)" -ForegroundColor White
Write-Host "  API:   http://localhost:3001/api/health" -ForegroundColor White
