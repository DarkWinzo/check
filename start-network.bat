@echo off
echo Starting Student Registration System for Network Access...
echo.

REM Get network IP
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    for /f "tokens=1" %%b in ("%%a") do (
        set NETWORK_IP=%%b
        goto :found
    )
)
:found

echo Network IP detected: %NETWORK_IP%
echo.
echo Frontend will be available at: http://%NETWORK_IP%:3000
echo Backend will be available at: http://%NETWORK_IP%:5000
echo.

REM Start backend
echo Starting Backend Server...
start "Backend Server" cmd /k "cd Backend && set NODE_ENV=development && npm start"

REM Wait a moment for backend to start
timeout /t 3 /nobreak > nul

REM Start frontend
echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd Frontend && npm run dev -- --host 0.0.0.0"

echo.
echo Both servers are starting...
echo Please wait a moment and then open: http://%NETWORK_IP%:3000
echo.
echo Admin Login:
echo Email: admin@example.com
echo Password: admin123
echo.
pause