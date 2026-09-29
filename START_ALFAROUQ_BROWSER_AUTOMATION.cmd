@echo off
title ALFAROUQ Browser Automation
set "URL=https://raw.githubusercontent.com/zongsm-cmyk/zongsm-cmyk/browser-control-chrome-use-v1/tools/alfarouq-browser-agent.ps1"
set "PS1=%TEMP%\alfarouq-browser-agent.ps1"
powershell -NoProfile -ExecutionPolicy Bypass -Command "Invoke-WebRequest -UseBasicParsing '%URL%' -OutFile '%PS1%'; & '%PS1%'"
echo.
echo Press any key to close.
pause >nul
