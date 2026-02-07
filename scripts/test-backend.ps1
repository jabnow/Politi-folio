# Test backend connection - run from project root
# Usage: .\scripts\test-backend.ps1

$url = "http://localhost:3001/api/health"
Write-Host "Testing backend at $url..." -ForegroundColor Cyan
try {
  $r = Invoke-RestMethod -Uri $url -ErrorAction Stop
  Write-Host "OK - Backend listening on port $($r.port)" -ForegroundColor Green
  Write-Host "  $($r | ConvertTo-Json -Compress)"
} catch {
  Write-Host "FAILED - Backend not reachable. Start it with: npm run dev:backend" -ForegroundColor Red
  Write-Host "  $($_.Exception.Message)"
  exit 1
}
