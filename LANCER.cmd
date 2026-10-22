@echo off
cd /d "%~dp0"
node atelier.mjs
if errorlevel 1 pause
