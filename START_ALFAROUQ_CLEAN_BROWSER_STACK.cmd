@echo off
title ALFAROUQ Clean Browser Stack Setup
set "URL=https://raw.githubusercontent.com/zongsm-cmyk/zongsm-cmyk/alfarouq-playwright-goose-v1/tools/setup-alfarouq-clean-browser-stack.ps1?cachebust=1"
set "PS1=%TEMP%\setup-alfarouq-clean-browser-stack.ps1"
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ProgressPreference='SilentlyContinue'; Invoke-WebRequest -UseBasicParsing -Headers @{'Cache-Control'='no-cache'} '%URL%' -OutFile '%PS1%'; & '%PS1%'"
echo.
echo Press any key to close.
pause >nul
