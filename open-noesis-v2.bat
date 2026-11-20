@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Starting NOESIS v7 local server at http://127.0.0.1:4173/ ...
echo Press Ctrl+C in this window to stop the server.
start "" "http://127.0.0.1:4173/"
where python >nul 2>nul
if %errorlevel%==0 (
  python -m http.server 4173 --bind 127.0.0.1 --directory "dist"
) else (
  call pnpm.cmd run preview -- --host 127.0.0.1 --port 4173
)
