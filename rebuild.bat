@echo off
setlocal
for %%I in ("%~dp0.") do set "PROJECT_DIR=%%~fI"
"%PROJECT_DIR%\tools\DevEco-Device-Tool\core\deveco-venv\Scripts\hos.exe" run --target clean --target buildprog --project-dir "%PROJECT_DIR%" --environment hi3861
exit /b %ERRORLEVEL%
