# AEGIS C2 System - Frontend Startup Script
$ErrorActionPreference = "Stop"

$workspaceRoot = $PSScriptRoot
$frontendDir = Join-Path $workspaceRoot "frontend"
$nodeDir = Join-Path $workspaceRoot ".bin\node-v20.18.0-win-x64"

$env:Path = "$nodeDir;$env:Path"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "       AEGIS COUNTER-UAS C2 SYSTEM - FRONTEND STARTUP      " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Node Runtime: $(node -v)" -ForegroundColor Gray
Write-Host "Target URL:   http://localhost:5173" -ForegroundColor Green
Write-Host "----------------------------------------------------------" -ForegroundColor DarkGray

Set-Location $frontendDir
npm run dev
