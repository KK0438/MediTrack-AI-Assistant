@echo off
echo Starting MediTracker Backend (port 5000), Frontend (port 5173), and AI Assistant (port 8001)...
start "MediTracker Backend" cmd /k "cd /d "%~dp0MediTracker-main\backend" && node server.js"
start "MediTracker Frontend" cmd /k "cd /d "%~dp0MediTracker-main\frontend\vite-project" && npm run dev"
start "MediTracker AI" cmd /k "cd /d "%~dp0MediTracker-main\meditracker-ai" && .\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8001"
echo.
echo ========================================================
echo   MediTracker servers launched!
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:5000
echo   AI Agent: http://127.0.0.1:8001
echo   Demo Login: demo@meditracker.com / demo123
echo ========================================================
