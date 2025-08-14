@echo off
echo Deploying AI Interview Assistant to GitHub Pages...
echo.

set SOURCE_DIR=%cd%
set DEST_DIR=C:\Users\naim.bro.k\naimbro.github.io\ai-interview

echo Creating destination directory...
if not exist "%DEST_DIR%" mkdir "%DEST_DIR%"

echo Copying files...
xcopy /E /Y /I "%SOURCE_DIR%\*.html" "%DEST_DIR%\"
xcopy /E /Y /I "%SOURCE_DIR%\css" "%DEST_DIR%\css\"
xcopy /E /Y /I "%SOURCE_DIR%\js" "%DEST_DIR%\js\"
xcopy /E /Y /I "%SOURCE_DIR%\config" "%DEST_DIR%\config\"
xcopy /E /Y /I "%SOURCE_DIR%\assets" "%DEST_DIR%\assets\"
copy /Y "%SOURCE_DIR%\README.md" "%DEST_DIR%\"

echo.
echo Files copied successfully!
echo.
echo Next steps:
echo 1. Navigate to: C:\Users\naim.bro.k\naimbro.github.io
echo 2. Run: git add ai-interview/
echo 3. Run: git commit -m "Add AI Interview Assistant"
echo 4. Run: git push
echo.
echo Your app will be available at: https://naimbro.github.io/ai-interview/
echo.
pause