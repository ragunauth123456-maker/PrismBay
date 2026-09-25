param(
  [string]$HealthUrl = 'http://127.0.0.1:5678/healthz',
  [int]$StartupTimeoutSeconds = 35,
  [switch]$CheckOnly
)
$ErrorActionPreference = 'Stop'
$logDir = Join-Path $env:LOCALAPPDATA 'PrismBay'
New-Item -ItemType Directory -Path $logDir -Force | Out-Null
$logPath = Join-Path $logDir 'n8n-service-supervisor.log'
$serviceLog = 'C:\PrismBayN8n.log'
$mutex = New-Object Threading.Mutex($false, 'Local\PrismBayN8nServiceSupervisor')
if (-not $mutex.WaitOne(0)) { Write-Output 'SKIP: service supervisor already running'; exit 0 }

function Record([string]$Code, [string]$Message) {
  if ((Test-Path $logPath) -and ((Get-Item $logPath).Length -gt 2097152)) {
    Move-Item -LiteralPath $logPath -Destination ($logPath + '.previous') -Force
  }
  $line = ('{0:o} code={1} message="{2}"' -f [DateTime]::UtcNow, $Code, ($Message -replace '"',''''))
  Add-Content -LiteralPath $logPath -Value $line -Encoding UTF8
  Write-Output $line
}

function Healthy {
  try {
    $response = Invoke-WebRequest -Uri $HealthUrl -UseBasicParsing -TimeoutSec 4
    return $response.StatusCode -eq 200
  } catch { return $false }
}

try {
  if (Healthy) { Record 'healthy' 'n8n HTTP 200'; exit 0 }
  if ($CheckOnly) { Record 'unhealthy' 'n8n health check failed'; exit 2 }

  $listener = Get-NetTCPConnection -LocalPort 5678 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($listener) {
    $process = Get-CimInstance Win32_Process -Filter ('ProcessId=' + $listener.OwningProcess) -ErrorAction SilentlyContinue
    if ($process -and $process.CommandLine -match '(?i)n8n') {
      Record 'stale_listener' ('stopping unresponsive n8n pid ' + $listener.OwningProcess)
      Stop-Process -Id $listener.OwningProcess -Force -ErrorAction Stop
      Start-Sleep -Seconds 2
    } else {
      Record 'port_conflict' ('port 5678 owned by non-n8n pid ' + $listener.OwningProcess)
      exit 4
    }
  }

  $n8n = Join-Path $env:APPDATA 'npm\n8n.cmd'
  if (-not (Test-Path $n8n)) { Record 'missing_binary' $n8n; exit 5 }

  $env:N8N_PORT = '5678'
  $env:N8N_RUNNERS_BROKER_PORT = '5679'
  $env:N8N_RUNNERS_TASK_TIMEOUT = '300'
  $comspec = $env:COMSPEC
  if ([string]::IsNullOrWhiteSpace($comspec)) {
    $comspec = Join-Path $env:SystemRoot 'System32\cmd.exe'
  }
  if (-not (Test-Path $comspec)) { Record 'missing_comspec' $comspec; exit 8 }
  $args = '/d /s /c ""' + $n8n + '" start >> "' + $serviceLog + '" 2>&1"'
  Start-Process -FilePath $comspec -ArgumentList $args -WindowStyle Hidden | Out-Null
  Record 'start_requested' 'detached n8n process launched'

  $deadline = (Get-Date).AddSeconds([Math]::Max(10, $StartupTimeoutSeconds))
  do {
    Start-Sleep -Seconds 1
    if (Healthy) { Record 'started' 'n8n HTTP 200 after launch'; exit 0 }
  } while ((Get-Date) -lt $deadline)

  Record 'start_failed' 'n8n did not become healthy before timeout'
  exit 6
} catch {
  Record 'supervisor_error' $_.Exception.GetType().Name
  exit 7
} finally {
  try { $mutex.ReleaseMutex() | Out-Null } catch {}
  $mutex.Dispose()
}
