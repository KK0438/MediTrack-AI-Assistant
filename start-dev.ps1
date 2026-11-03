Write-Host "Starting MediTracker Backend, Frontend, and AI Assistant..." -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Start-Process pwsh -ArgumentList "-NoExit", "-Command", "Set-Location '$scriptDir\MediTracker-main\backend'; node server.js"
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "Set-Location '$scriptDir\MediTracker-main\frontend\vite-project'; npm run dev"
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "Set-Location '$scriptDir\MediTracker-main\meditracker-ai'; .\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8001"

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host "  MediTracker servers launched!" -ForegroundColor Green
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host "  Backend:  http://localhost:5000" -ForegroundColor Yellow
Write-Host "  AI Agent: http://127.0.0.1:8001" -ForegroundColor Yellow
Write-Host "  Demo Login: demo@meditracker.com / demo123" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Green
