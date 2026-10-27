@echo off
title HE THONG THUYET MINH SO THU TU DONG (THAO CAM VIEN SAI GON)
color 0B

echo ===============================================================================
echo     HE THONG THUYET MINH SO THU TU DONG DA NGON NGU (QR + GPS)
echo     Thao Cam Vien Sai Gon - PRD v2.0
echo ===============================================================================
echo.

set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

echo [1/3] Khoi dong Backend Core .NET 10 API (Port 5222)...
start "Backend Core API - Port 5222" cmd /k "cd /d "%SCRIPT_DIR%Backend_core\ZooAudioGuide.API" && dotnet run --urls http://localhost:5222"

echo [2/3] Khoi dong Microservice Thuyet Minh Tu Dong (Port 5292)...
start "Narration Service - Port 5292" cmd /k "cd /d "%SCRIPT_DIR%MicroServices\ZooAudioGuide.NarrationService" && dotnet run --urls http://localhost:5292"

timeout /t 3 /nobreak > nul

echo [3/3] Mo giao dien Trang Chu Web Du Khach...
start "" "%SCRIPT_DIR%index.html"

echo.
echo ===============================================================================
echo  DA KHOI DONG THANH CONG CAC DICH VU:
echo  - Backend Core API:     http://localhost:5222/api/animals
echo  - Narration Service:     http://localhost:5292
echo  - Trang Chu (Home):      index.html
echo  - Ban Do So Thu (Map):   map.html
echo  - Danh Muc Ma QR:        qr.html
echo  - Trang Quan Tri (Admin):admin.html
echo ===============================================================================
echo.
pause
