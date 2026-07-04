@echo off
setlocal enabledelayedexpansion

set "APP=hanubees"
set "INSTALL_DIR=%USERPROFILE%\.hanubees\bin"

if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

echo Installing hanubees...

REM Detect architecture
set "ARCH=x64"
if "%PROCESSOR_ARCHITECTURE%"=="ARM64" set "ARCH=arm64"
if "%PROCESSOR_ARCHITEW6432%"=="ARM64" set "ARCH=arm64"

set "FILENAME=%APP%-windows-%ARCH%.zip"
set "URL=https://github.com/varsansri/hanubees-coding-agent/releases/latest/download/%FILENAME%"
set "ZIP=%TEMP%\hanubees-install.zip"

REM Download using PowerShell
echo Downloading...
powershell -Command "$ProgressPreference='SilentlyContinue'; Invoke-WebRequest -Uri '%URL%' -OutFile '%ZIP%' -UseBasicParsing"
if errorlevel 1 (
    echo Download failed
    exit /b 1
)

echo Extracting...
powershell -Command "Expand-Archive -Force -Path '%ZIP%' -DestinationPath '%INSTALL_DIR%'"
del "%ZIP%"

REM Add to user PATH permanently
set "NEWPATH=%INSTALL_DIR%"
for /f "skip=2 tokens=3*" %%a in ('reg query "HKCU\Environment" /v Path 2^>nul') do set "USERPATH=%%a %%b"
if "%USERPATH%"=="" set "USERPATH=%PATH%"
echo !USERPATH! | find /i "!NEWPATH!" >nul
if errorlevel 1 (
    reg add "HKCU\Environment" /v Path /t REG_EXPAND_SZ /d "!NEWPATH!;!USERPATH!" /f
    echo Added to PATH permanently.
)

REM Update current session PATH
set "PATH=%INSTALL_DIR%;%PATH%"

echo.
echo HanuBees installed successfully!
echo Type "hanubees" to start.
echo.
hanubees --version 2>nul || echo Please open a new command prompt to use hanubees.
