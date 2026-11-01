@echo off
setlocal
echo ==========================================================
echo        AEGIS COUNTER-UAS C2 SYSTEM - FRONTEND STARTUP     
echo ==========================================================

set "PATH=%~dp0.bin\node-v20.18.0-win-x64;%PATH%"

cd /d "%~dp0frontend"
echo Starting Vite server on http://localhost:5173 ...
call npm run dev
pause
