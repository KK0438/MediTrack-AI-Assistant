@echo off
echo Starting MediTracker Backend (port 4000) and Frontend (port 5173)...
start "MediTracker Backend" cmd /k "cd /d "%~dp0MediTracker-main\backend" && node server.js"
start "MediTracker Frontend" cmd /k "cd /d "%~dp0MediTracker-main\frontend\vite-project" && npm run dev"
echo.
echo ========================================================
echo   MediTracker servers launched!
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:4000
echo   Demo Login: demo@meditracker.com / demo123
echo ========================================================
