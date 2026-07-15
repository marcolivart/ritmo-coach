@echo off
cd /d %~dp0
if exist node_modules rmdir /s /q node_modules
call npm install
if errorlevel 1 goto error
call npm run build
if errorlevel 1 goto error
echo.
echo Ritmo se ha instalado y compilado correctamente.
echo Ejecuta: npm run dev
pause
exit /b 0
:error
echo.
echo Se ha producido un error. Copia el texto de esta ventana.
pause
exit /b 1
