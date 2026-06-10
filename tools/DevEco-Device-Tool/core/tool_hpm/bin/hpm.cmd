@ECHO off
GOTO start
:find_dp0
SET dp0=%~dp0
CD ..\..\
SET dp1=%cd%
EXIT /b
:start
SETLOCAL
CALL :find_dp0
SET "_prog=node"
SET PATHEXT=%PATHEXT:;.JS;=;%
endLocal & goto #_undefined_# 2>NUL || title %COMSPEC% & "%_prog%"  "%dp0%\hpm" %*
