@echo off
setlocal EnableExtensions
for %%I in ("%~dp0.") do set "PROJECT_DIR=%%~fI"
set "CONFIG_FILE=%PROJECT_DIR%\.deveco\deveco.ini"
set "PYTHON38=%PROJECT_DIR%\tools\DevTools_Hi3861V100_v1.0\thirdparty\python38\python.exe"
set "MONITOR_PORT="
set "MONITOR_SPEED="
for /f "tokens=1,* delims==" %%A in ('findstr /C:"monitor_port =" "%CONFIG_FILE%"') do set "MONITOR_PORT=%%B"
for /f "tokens=1,* delims==" %%A in ('findstr /C:"monitor_speed =" "%CONFIG_FILE%"') do set "MONITOR_SPEED=%%B"
set "MONITOR_PORT=%MONITOR_PORT: =%"
set "MONITOR_SPEED=%MONITOR_SPEED: =%"
if "%MONITOR_PORT%"=="" (
    echo monitor_port not found in "%CONFIG_FILE%"
    exit /b 1
)
"%PYTHON38%" -c "import sys; from serial.tools.miniterm import main; sys.argv=['miniterm', r'%MONITOR_PORT%', r'%MONITOR_SPEED%', '--eol', 'CRLF']; main()"
exit /b %ERRORLEVEL%
