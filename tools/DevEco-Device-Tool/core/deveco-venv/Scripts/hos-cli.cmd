@echo off
call D:\Huawei\DevEco-Device-Tool\core\deveco-venv\Scripts\activate.bat
set argc=0
for %%x in (%*) do Set /A argc+=1
if %argc% == 0 (
    call cmd
) else (
    hos.exe %*
)
