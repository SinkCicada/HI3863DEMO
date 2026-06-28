@echo off
setlocal EnableExtensions EnableDelayedExpansion
for %%I in ("%~dp0.") do set "PROJECT_DIR=%%~fI"
set "CONFIG_FILE=%PROJECT_DIR%\.deveco\deveco.ini"
set "BURN_TOOL=%PROJECT_DIR%\tools\DevTools_Hi3861V100_v1.0\burntool\BurnTool.exe"
set "APP_BIN=%PROJECT_DIR%\src\out\hispark_pegasus\wifiiot_hispark_pegasus\Hi3861_wifiiot_app_allinone.bin"
set "UPLOAD_PORT="
set "UPLOAD_SPEED="
set "UPLOAD_RESET="
for /f "tokens=1,* delims==" %%A in ('findstr /C:"upload_port =" "%CONFIG_FILE%"') do set "UPLOAD_PORT=%%B"
for /f "tokens=1,* delims==" %%A in ('findstr /C:"upload_speed =" "%CONFIG_FILE%"') do set "UPLOAD_SPEED=%%B"
for /f "tokens=1,* delims==" %%A in ('findstr /C:"upload_reset =" "%CONFIG_FILE%"') do set "UPLOAD_RESET=%%B"
set "UPLOAD_PORT=%UPLOAD_PORT: =%"
set "UPLOAD_SPEED=%UPLOAD_SPEED: =%"
set "UPLOAD_RESET=%UPLOAD_RESET: =%"
set "UPLOAD_COM=%UPLOAD_PORT%"
set "UPLOAD_COM=%UPLOAD_COM:COM=%"
set "UPLOAD_COM=%UPLOAD_COM:com=%"
if not exist "%APP_BIN%" (
    echo app bin not found: "%APP_BIN%"
    exit /b 1
)
if not exist "%BURN_TOOL%" (
    echo burn tool not found: "%BURN_TOOL%"
    exit /b 1
)
if "%UPLOAD_COM%"=="" (
    echo upload_port not found in "%CONFIG_FILE%"
    exit /b 1
)
if /I "%UPLOAD_RESET%"=="yes" (
    "%BURN_TOOL%" -com:%UPLOAD_COM% -bin:%APP_BIN% -signalbaud:%UPLOAD_SPEED% -reset
) else (
    "%BURN_TOOL%" -com:%UPLOAD_COM% -bin:%APP_BIN% -signalbaud:%UPLOAD_SPEED%
)
exit /b %ERRORLEVEL%
