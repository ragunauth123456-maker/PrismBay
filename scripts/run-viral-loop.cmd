@echo off
setlocal
set REPO=C:\Users\Fano Faizul\PrismBayGithub
set LOG=C:\PrismBayViral.log
cd /d "%REPO%" || exit /b 1
echo [%date% %time%] viral refresh starting>>"%LOG%"
git pull --rebase origin main >>"%LOG%" 2>&1
if errorlevel 1 goto :fail
node scripts\viral-product-engine.mjs >>"%LOG%" 2>&1
if errorlevel 1 goto :fail
git add public\viral-catalog.json growth-reports\viral-content-queue.json
git diff --cached --quiet
if not errorlevel 1 goto :done
git commit -m "Refresh viral product signals" >>"%LOG%" 2>&1
if errorlevel 1 goto :fail
git pull --rebase origin main >>"%LOG%" 2>&1
if errorlevel 1 goto :fail
git push origin main >>"%LOG%" 2>&1
if errorlevel 1 goto :fail
:done
echo [%date% %time%] viral refresh complete>>"%LOG%"
exit /b 0
:fail
echo [%date% %time%] viral refresh failed>>"%LOG%"
exit /b 1
