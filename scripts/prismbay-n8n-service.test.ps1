$ErrorActionPreference='Stop'
$scriptPath = Join-Path $PSScriptRoot 'prismbay-n8n-service.ps1'
$tokens=$null;$errors=$null
[System.Management.Automation.Language.Parser]::ParseFile($scriptPath,[ref]$tokens,[ref]$errors) | Out-Null
if($errors.Count -gt 0){throw ('PowerShell parse errors: '+($errors.Message -join '; '))}
$content=Get-Content $scriptPath -Raw
foreach($needle in @(
  'Local\PrismBayN8nServiceSupervisor',
  'Get-NetTCPConnection -LocalPort 5678',
  'CommandLine -match ''(?i)n8n''',
  'Start-Process',
  'N8N_RUNNERS_BROKER_PORT',
  'start_failed',
  'StartupTimeoutSeconds'
)){
  if(-not $content.Contains($needle)){throw ('Missing supervisor safeguard: '+$needle)}
}
if($content -match 'Stop-Process.+ErrorAction SilentlyContinue'){throw 'Supervisor must not silently ignore an n8n stop failure'}
Write-Output 'PASS: n8n service supervisor syntax and safeguards'
