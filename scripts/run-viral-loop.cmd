@echo off
setlocal
set "REPO=%~dp0.."
if defined PRISMBAY_LOG_DIR (
  set "LOGDIR=%PRISMBAY_LOG_DIR%"
) else (
  if not defined LOCALAPPDATA set "LOCALAPPDATA=%TEMP%"
  set "LOGDIR=%LOCALAPPDATA%\PrismBay"
)
if not exist "%LOGDIR%" mkdir "%LOGDIR%" >nul 2>&1
set "LOG=%LOGDIR%\viral-refresh.log"
cd /d "%REPO%" || exit /b 1
echo [%date% %time%] viral refresh starting>>"%LOG%"
rem Generated feeds are disposable. Clear partial-run changes without touching unrelated work.
git restore --worktree -- public\viral-catalog.json public\viral-candidates.json growth-reports\viral-content-queue.json growth-reports\viral-promotion-queue.json >>"%LOG%" 2>&1
git pull --rebase origin main >>"%LOG%" 2>&1
if errorlevel 1 goto :fail
node scripts\viral-product-engine.mjs >>"%LOG%" 2>&1
if errorlevel 1 goto :fail
node scripts\viral-candidate-engine.mjs >>"%LOG%" 2>&1
if errorlevel 1 goto :fail
if "%CJ_MCP_ENABLE%"=="1" (
  node scripts\cj-mcp-scout.mjs --check-session >nul 2>&1
  if not errorlevel 1 (
    node scripts\cj-mcp-scout.mjs >>"%LOG%" 2>&1
    if errorlevel 1 echo WARNING: CJ scout failed; continuing product refresh>>"%LOG%"
  )
)
node scripts\render-viral-queue.mjs >>"%LOG%" 2>&1
if errorlevel 1 echo WARNING: video renderer failed; continuing product refresh>>"%LOG%"
git add public\viral-catalog.json public\viral-candidates.json growth-reports\viral-content-queue.json growth-reports\viral-promotion-queue.json
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
