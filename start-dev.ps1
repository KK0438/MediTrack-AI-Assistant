Write-Host "Starting MediTracker Backend and Frontend..." -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Start-Process pwsh -ArgumentList "-NoExit", "-Command", "Set-Location '$scriptDir\MediTracker-main\backend'; node server.js"
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "Set-Location '$scriptDir\MediTracker-main\frontend\vite-project'; npm run dev"

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host "  MediTracker servers launched!" -ForegroundColor Green
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host "  Backend:  http://localhost:4000" -ForegroundColor Yellow
Write-Host "  Demo Login: demo@meditracker.com / demo123" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Green
