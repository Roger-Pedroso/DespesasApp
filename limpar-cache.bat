@echo off
echo ========================================
echo Limpando Cache do Metro Bundler
echo ========================================

cd C:\Projetos\DespesasApp

echo.
echo [1/4] Limpando cache local do Metro...
if exist .metroCache (
    rmdir /s /q .metroCache
    echo ✅ Cache local deletado
)

echo.
echo [2/4] Limpando cache global npm...
call npm cache clean --force
echo ✅ Cache npm limpo

echo.
echo [3/4] Limpando node_modules (opcional)...
echo Isso pode levar alguns minutos...
timeout /t 5

if exist node_modules (
    rmdir /s /q node_modules
    echo ✅ node_modules deletado
    echo.
    echo [4/4] Reinstalando dependências...
    call npm install
    echo ✅ npm install concluído
) else (
    echo ✅ node_modules já não existe
)

echo.
echo ========================================
echo ✅ Limpeza completa! 
echo.
echo PRÓXIMO PASSO: Execute no terminal:
echo npm start -- --reset-cache
echo.
echo Depois pressione 'a' para Android
echo ========================================
pause
