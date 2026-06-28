@echo off
setlocal EnableExtensions
for %%I in ("%~dp0.") do set "PROJECT_DIR=%%~fI"
set "OUT_DIR=%PROJECT_DIR%\src\out\hispark_pegasus\wifiiot_hispark_pegasus"
set "NINJA=%PROJECT_DIR%\tools\DevTools_Hi3861V100_v1.0\thirdparty\python38\Scripts\ninja.exe"
set "SITE_PACKAGES=%PROJECT_DIR%\tools\DevEco-Device-Tool\core\deveco-venv\Lib\site-packages"
set "TOOLCHAIN_BIN=%PROJECT_DIR%\tools\DevTools_Hi3861V100_v1.0\hcc_riscv32_win\bin"
set "GIT_BIN=%PROJECT_DIR%\tools\DevTools_Hi3861V100_v1.0\thirdparty\Git\bin"
set "GIT_USR_BIN=%PROJECT_DIR%\tools\DevTools_Hi3861V100_v1.0\thirdparty\Git\usr\bin"
set "SCONS_SHIM_DIR=%TEMP%\hi3863-scons-shim"
set "PYTHONHOME="
if not exist "%SCONS_SHIM_DIR%" mkdir "%SCONS_SHIM_DIR%"
> "%SCONS_SHIM_DIR%\scons" (
    echo #!/bin/sh
    echo exec python -c "from SCons.Script.Main import main; main()" "$@"
)
set "PATH=%SCONS_SHIM_DIR%;%TOOLCHAIN_BIN%;%GIT_BIN%;%GIT_USR_BIN%;%PATH%"
set "PYTHONPATH=%SITE_PACKAGES%"
"%NINJA%" -C "%OUT_DIR%"
exit /b %ERRORLEVEL%
