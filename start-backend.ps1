# AEGIS C2 System - Backend Startup Script
$ErrorActionPreference = "Stop"

$workspaceRoot = $PSScriptRoot
$backendDir = Join-Path $workspaceRoot "aegis\aegis"
$jarPath = Join-Path $backendDir "target\aegis-backend-0.0.1-SNAPSHOT.jar"

# Locate Java executable
$java = "C:\Program Files\Java\jdk-26.0.2.1\bin\java.exe"
if (-not (Test-Path $java)) {
    $java = (Get-Command java.exe -ErrorAction SilentlyContinue).Source
}

if (-not $java -or -not (Test-Path $java)) {
    Write-Error "Java runtime not found. Please ensure JDK 21+ is installed."
    exit 1
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "       AEGIS COUNTER-UAS C2 SYSTEM - BACKEND STARTUP       " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Java Runtime: $java" -ForegroundColor Gray
Write-Host "JAR Path:     $jarPath" -ForegroundColor Gray
Write-Host "Target Port:  8443 (HTTPS with aegis-local.p12 keystore)" -ForegroundColor Gray
Write-Host "H2 Database:  ./data/aegisdb" -ForegroundColor Gray
Write-Host "----------------------------------------------------------" -ForegroundColor DarkGray

if (-not (Test-Path $jarPath)) {
    Write-Host "JAR not found. Compiling and packaging backend with Maven..." -ForegroundColor Yellow
    $mvn = Join-Path $workspaceRoot ".bin\maven\bin\mvn.cmd"
    Set-Location $backendDir
    & $mvn package -DskipTests
}

Set-Location $backendDir
Write-Host "Starting AEGIS Spring Boot Application (dev profile)..." -ForegroundColor Green
& $java -Dspring.profiles.active=dev -jar $jarPath
