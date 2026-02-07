# Test backend <-> frontend routing
# Run from project root

$ErrorActionPreference = "Continue"

Write-Host "=== Backend/Frontend Connection Test ===" -ForegroundColor Cyan
Write-Host ""

# 1. Direct backend (port 3001)
Write-Host "1. Direct backend (localhost:3001)" -ForegroundColor Yellow
try {
  $r = Invoke-RestMethod -Uri "http://localhost:3001/api/health" -TimeoutSec 3
  Write-Host "   OK - Backend responding: port=$($r.port)" -ForegroundColor Green
  $backendOk = $true
} catch {
  Write-Host "   FAIL - Backend not reachable. Start with: cd backend; npm run dev" -ForegroundColor Red
  $backendOk = $false
}
Write-Host ""

# 2. Backend API endpoints
if ($backendOk) {
  Write-Host "2. Backend API endpoints" -ForegroundColor Yellow
  $endpoints = @(
    @{ path = "/api/events"; name = "events" },
    @{ path = "/api/reconciliation-tasks"; name = "reconciliation-tasks" },
    @{ path = "/api/decisions"; name = "decisions" },
    @{ path = "/api/reconciliation"; name = "reconciliation" }
  )
  foreach ($ep in $endpoints) {
    try {
      $r = Invoke-RestMethod -Uri "http://localhost:3001$($ep.path)" -TimeoutSec 3
      $count = if ($r -is [array]) { $r.Count } elseif ($r.events) { $r.events.Count } else { ($r | ConvertTo-Json).Length }
      Write-Host "   OK $($ep.name): $($r.GetType().Name)" -ForegroundColor Green
    } catch {
      Write-Host "   FAIL $($ep.name): $($_.Exception.Message)" -ForegroundColor Red
    }
  }
  Write-Host ""
}

# 3. Vite proxy (port 5173) - frontend must be running
Write-Host "3. Vite proxy (localhost:5173 -> 3001)" -ForegroundColor Yellow
try {
  $r = Invoke-RestMethod -Uri "http://localhost:5173/api/health" -TimeoutSec 3
  Write-Host "   OK - Proxy routing: /api -> backend port=$($r.port)" -ForegroundColor Green
  $proxyOk = $true
} catch {
  Write-Host "   FAIL - Frontend not reachable or proxy error. Start with: cd frontend; npm run dev" -ForegroundColor Red
  $proxyOk = $false
}
Write-Host ""

# 4. Full proxy path
if ($proxyOk) {
  Write-Host "4. Full proxy path (/api/events via 5173)" -ForegroundColor Yellow
  try {
    $r = Invoke-RestMethod -Uri "http://localhost:5173/api/events" -TimeoutSec 3
    $count = if ($r -is [array]) { $r.Count } else { 0 }
    Write-Host "   OK - Got $count events via proxy" -ForegroundColor Green
  } catch {
    Write-Host "   FAIL: $($_.Exception.Message)" -ForegroundColor Red
  }
}
Write-Host ""

# Summary
Write-Host "=== Routing summary ===" -ForegroundColor Cyan
Write-Host "  Frontend:  http://localhost:5173  (Vite)"
Write-Host "  Backend:   http://localhost:3001  (Express)"
Write-Host "  Proxy:     /api/* --> http://localhost:3001/api/*"
Write-Host ""
