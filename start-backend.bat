@echo off
setlocal
echo ==========================================================
echo        AEGIS COUNTER-UAS C2 SYSTEM - BACKEND STARTUP      
echo ==========================================================

set "JAVA_EXE=C:\Program Files\Java\jdk-26.0.2.1\bin\java.exe"
if not exist "%JAVA_EXE%" (
    set "JAVA_EXE=java"
)

set "JAR_PATH=%~dp0aegis\aegis\target\aegis-backend-0.0.1-SNAPSHOT.jar"

if not exist "%JAR_PATH%" (
    echo Packaging backend with Maven...
    cd /d "%~dp0aegis\aegis"
    call "%~dp0.bin\maven\bin\mvn.cmd" package -DskipTests
)

cd /d "%~dp0aegis\aegis"
echo Starting Spring Boot on https://localhost:8443 ...
"%JAVA_EXE%" -jar "%JAR_PATH%"
pause
