@echo off
echo ========================================
echo   SeizoWatch System Startup
echo ========================================
echo.

echo [1/2] Starting Camera Control API Server...
start "SeizoWatch API" cmd /k "python camera_server.py"
timeout /t 3 /nobreak > nul

echo [2/2] Starting Dashboard...
cd dashboard
start "SeizoWatch Dashboard" cmd /k "npm run dev"

echo.
echo ========================================
echo   System Started!
echo ========================================
echo.
echo Camera API: http://localhost:5000
echo Dashboard:  http://localhost:5173
echo.
echo Press any key to exit...
pause > nul
