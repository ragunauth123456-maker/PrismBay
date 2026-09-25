# Self-healing watchdog for the existing local n8n instance. No remote access or credentials.
param([switch]$DryRun, [string]$HealthUrl = 'http://127.0.0.1:5678/healthz')
$ErrorActionPreference = "Stop"
$task = "PrismBay n8n Service"
$health = $HealthUrl
$logDir = Join-Path $env:LOCALAPPDATA "PrismBay"
New-Item -ItemType Directory -Path $logDir -Force | Out-Null
$log = Join-Path $logDir "n8n-watchdog.log"
$statePath = Join-Path $logDir "n8n-watchdog-state.json"
$mutex = New-Object Threading.Mutex($false, "Local\PrismBayN8nWatchdog")
if (-not $mutex.WaitOne(0)) { Write-Output "SKIP: watchdog already running"; exit 0 }
function Record([string]$message) {
  if ((Test-Path $log) -and ((Get-Item $log).Length -gt 2097152)) {
    Move-Item -LiteralPath $log -Destination ($log + '.previous') -Force
  }
  $line = (Get-Date).ToUniversalTime().ToString("o") + " " + $message
  Add-Content -LiteralPath $log -Value $line -Encoding UTF8
  Write-Output $line
}
function Healthy {
  try {
    $r = Invoke-WebRequest -Uri $health -UseBasicParsing -TimeoutSec 5
    return ($r.StatusCode -eq 200)
  } catch { return $false }
}
try {
  if (Healthy) { Record "HEALTHY: local n8n HTTP 200"; exit 0 }
  Start-Sleep -Seconds 3
  if (Healthy) { Record "HEALTHY: recovered without intervention"; exit 0 }
  if ($DryRun) { Record "DRY_RUN: n8n unhealthy; would request restart"; exit 2 }
  $state = @{ attemptTimes = @() }
  if (Test-Path $statePath) {
    try { $state = Get-Content $statePath -Raw | ConvertFrom-Json } catch { Record "WARN: unreadable watchdog state; resetting" }
  }
  $now = [DateTime]::UtcNow
  $prior = @($state.attemptTimes) | Where-Object {
    try { ([DateTime]$_).ToUniversalTime() -gt $now.AddHours(-1) } catch { $false }
  }
  if ($prior.Count -ge 3) { Record "ALERT: three recent restart requests; manual check required"; exit 3 }
  $prior += $now.ToString("o")
  @{ attemptTimes = @($prior) } | ConvertTo-Json | Set-Content -LiteralPath $statePath -Encoding UTF8
  $known = Get-ScheduledTask -TaskName $task -ErrorAction Stop
  if ($known.State -eq "Running") {
    Record "ALERT: n8n service task running but HTTP unavailable; not spawning duplicates"
    exit 4
  }
  Start-ScheduledTask -TaskName $task -ErrorAction Stop
  Record "RESTART_REQUESTED: invoked existing n8n service task"
  Start-Sleep -Seconds 12
  if (Healthy) { Record "RECOVERED: HTTP 200 after scheduled restart"; exit 0 }
  Record "ALERT: restart requested but n8n still unhealthy"; exit 5
} catch {
  Record ("ALERT: watchdog error: " + $_.Exception.GetType().Name)
  exit 6
} finally { $mutex.ReleaseMutex(); $mutex.Dispose() }
