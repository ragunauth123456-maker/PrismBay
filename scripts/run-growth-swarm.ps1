$ErrorActionPreference = 'Continue'
$repo = 'C:\Users\Fano Faizul\PrismBayGithub'
$log = 'C:\PrismBayGrowth.log'
Set-Location $repo

function Log([string]$m) {
  $line = ('{0:u} {1}' -f (Get-Date).ToUniversalTime(), $m)
  Add-Content -Path $log -Value $line
}

Log 'hourly growth swarm starting'
try {
  git pull --ff-only origin main 2>&1 | ForEach-Object { Log $_ }
} catch {
  Log ('pull warning: ' + $_.Exception.Message)
}

# YouTube safety checks are independent of the retail workers below.
node --test scripts\youtube-publishing-guard.test.mjs scripts\youtube-publishing-gateway.test.mjs scripts\youtube-publishing-entrypoint.test.mjs 2>&1 | ForEach-Object { Log $_ }
if ($LASTEXITCODE -ne 0) { Log 'YOUTUBE GATE ALERT: regression tests failed; YouTube publication remains disabled' }
node scripts\install-youtube-studio-gate.mjs --check 2>&1 | ForEach-Object { Log $_ }
if ($LASTEXITCODE -ne 0) { Log 'YOUTUBE GATE ALERT: K1 Studio entry-point drift; reinstall and re-verify before publication' }

$roles = @(
  'Trend Scout',
  'Hook/Creative Writer',
  'Storefront CRO Auditor',
  'Creator/Partner Scout',
  'Publisher',
  'Analytics Reviewer',
  'Offer Optimizer',
  'GitHub Support Scout'
)

foreach ($role in $roles) {
  try {
    node scripts\organic-growth-agent.mjs $role 2>&1 | ForEach-Object { Log $_ }
  } catch {
    Log ($role + ' failed: ' + $_.Exception.Message)
  }
}

git add scripts\organic-growth-agent.mjs scripts\run-growth-swarm.ps1 growth-reports 2>&1 | ForEach-Object { Log $_ }
$pending = git diff --cached --name-only
if ($pending) {
  $stamp = (Get-Date).ToUniversalTime().ToString('yyyy-MM-dd HH:mm')
  git commit -m ('Growth swarm report ' + $stamp + ' UTC') 2>&1 | ForEach-Object { Log $_ }
  git push origin main 2>&1 | ForEach-Object { Log $_ }
} else {
  Log 'no report changes to push'
}

Log 'hourly growth swarm finished'
