@echo off
echo Deploying AI Interview Assistant to GitHub Pages...
echo.

set /p REPO_PATH="Enter path to your naimbro.github.io folder (or press Enter for default): "

if "%REPO_PATH%"=="" set REPO_PATH=C:\Users\naim.bro.k\naimbro.github.io

echo.
echo Using repository path: %REPO_PATH%
echo.

if not exist "%REPO_PATH%" (
    echo ERROR: Repository path does not exist!
    echo Please clone your GitHub Pages repo first:
    echo git clone https://github.com/naimbro/naimbro.github.io.git
    pause
    exit /b 1
)

echo Creating ai-interview directory...
if not exist "%REPO_PATH%\ai-interview" mkdir "%REPO_PATH%\ai-interview"

echo Copying files...
xcopy /E /Y /I "%~dp0*" "%REPO_PATH%\ai-interview\" /EXCLUDE:%~dp0deploy_exclude.txt

echo.
echo Files copied! Now you need to:
echo.
echo 1. Open Command Prompt/Terminal
echo 2. Navigate to: %REPO_PATH%
echo 3. Run these commands:
echo    git add ai-interview/
echo    git commit -m "Add AI Interview Assistant"
echo    git push
echo.
echo 4. Your app will be available at:
echo    https://naimbro.github.io/ai-interview/test.html
echo    https://naimbro.github.io/ai-interview/index.html
echo.

pause