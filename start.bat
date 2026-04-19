@echo off
setlocal
title Music Prompt Studio
chcp 65001 > nul

cd /d "%~dp0"

echo ===============================================
echo   Music Prompt Studio - Start
echo ===============================================
echo.

REM ----- 1. Ollama-Status pruefen ------------------------------------------
REM curl liefert HTTP-Status nach STDOUT bei -w "%%{http_code}". Bei
REM kompletter Nicht-Erreichbarkeit (Connection refused) ist Exit-Code != 0.
set OLLAMA_STATUS=000
for /f "delims=" %%S in ('curl -s -o nul -w "%%{http_code}" --max-time 2 http://localhost:11434/api/tags 2^>nul') do set OLLAMA_STATUS=%%S

if "%OLLAMA_STATUS%"=="200" (
    echo [OK] Ollama laeuft bereits ^(http://localhost:11434^)
) else (
    echo [...] Ollama nicht erreichbar - starte 'ollama serve' im Hintergrund...
    where ollama >nul 2>&1
    if errorlevel 1 (
        echo [WARN] 'ollama' ist nicht im PATH. Bitte Ollama installieren:
        echo        https://ollama.com/download/windows
        echo        Die App startet trotzdem - KI-Funktionen bleiben aus.
    ) else (
        start "Ollama Serve" /min cmd /c "ollama serve"
        echo       Warte 4 Sekunden auf Ollama...
        timeout /t 4 /nobreak > nul
    )
)
echo.

REM ----- 2. node_modules pruefen -------------------------------------------
if not exist "node_modules" (
    echo [...] node_modules fehlt - fuehre 'npm install' aus...
    call npm install
    if errorlevel 1 (
        echo [FEHLER] npm install fehlgeschlagen.
        pause
        exit /b 1
    )
    echo.
)

REM ----- 3. Vite Dev-Server im Hintergrund starten -------------------------
echo [...] Starte Vite Dev-Server auf Port 5173...
start "MPS Dev-Server" /min cmd /c "npm run dev"

REM ----- 4. Auf Server warten und Browser oeffnen --------------------------
echo       Warte auf Vite ^(max. 15 Sekunden^)...
set TRIES=0
:waitloop
set /a TRIES+=1
timeout /t 1 /nobreak > nul
curl -s -o nul --max-time 1 http://localhost:5173 >nul 2>&1
if %ERRORLEVEL%==0 goto ready
if %TRIES% GEQ 15 goto giveup
goto waitloop

:ready
echo [OK] Vite bereit. Oeffne Browser...
start "" http://localhost:5173
goto endinfo

:giveup
echo [WARN] Vite wurde nicht innerhalb von 15s erreichbar.
echo        Oeffne den Browser manuell unter http://localhost:5173
start "" http://localhost:5173

:endinfo
echo.
echo ===============================================
echo   Music Prompt Studio laeuft.
echo   Zum Beenden: dieses Fenster, das MPS-Fenster
echo   und ggf. das Ollama-Fenster schliessen.
echo ===============================================
echo.
pause
endlocal
