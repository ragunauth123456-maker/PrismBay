param()
$ErrorActionPreference = 'Stop'
$base = [Environment]::GetFolderPath('LocalApplicationData')
if ([string]::IsNullOrWhiteSpace($base)) { $base = $env:TEMP }
if ([string]::IsNullOrWhiteSpace($base)) { exit 9 }
$logDir = Join-Path $base 'PrismBay'
New-Item -ItemType Directory -Path $logDir -Force | Out-Null
$logPath = Join-Path $logDir 'viral-task-launcher.log'
function Record([string]$Code) {
  if ((Test-Path $logPath) -and ((Get-Item $logPath).Length -gt 1048576)) {
    Move-Item -LiteralPath $logPath -Destination ($logPath + '.previous') -Force
  }
  Add-Content -LiteralPath $logPath -Value ((Get-Date).ToUniversalTime().ToString('o') + ' code=' + $Code) -Encoding UTF8
}
Record 'start'
$result = 1
try {
  $repo = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
  $profile = [Environment]::GetFolderPath('UserProfile')
  if ([string]::IsNullOrWhiteSpace($profile)) { $profile = $env:USERPROFILE }
  $env:CJ_MCP_ENABLE = '0'
  if (-not [string]::IsNullOrWhiteSpace($profile)) {
    $session = Join-Path $profile '.cj-mcp-token'
    $configPath = Join-Path $profile '.codex\config.toml'
    if ((Test-Path -LiteralPath $session -PathType Leaf) -and (Test-Path -LiteralPath $configPath -PathType Leaf)) {
      $text = [IO.File]::ReadAllText($configPath)
      $block = [regex]::Match($text, '(?ms)^\[mcp_servers\.CJMCP\.env\][ \t]*\r?\n(?<body>.*?)(?=^\[|\z)')
      if ($block.Success) {
        $secret = [regex]::Match($block.Groups['body'].Value, '(?m)^TOKEN_ENCRYPT_KEY[ \t]*=[ \t]*"(?<value>[0-9a-fA-F]{96})"[ \t]*$')
        if ($secret.Success) {
          $env:TOKEN_ENCRYPT_KEY = $secret.Groups['value'].Value
          $env:CJ_MCP_ENABLE = '1'
        }
      }
    }
  }
  Record ('cj_' + $(if ($env:CJ_MCP_ENABLE -eq '1') { 'enabled' } else { 'disabled' }))
  $windows = $env:SystemRoot
  if ([string]::IsNullOrWhiteSpace($windows)) { $windows = $env:WINDIR }
  if ([string]::IsNullOrWhiteSpace($windows)) { $windows = 'C:\Windows' }
  $cmd = Join-Path $windows 'System32\cmd.exe'
  $runner = Join-Path $PSScriptRoot 'run-viral-loop.cmd'
  if (-not (Test-Path -LiteralPath $cmd -PathType Leaf)) { Record 'missing_cmd'; exit 10 }
  if (-not (Test-Path -LiteralPath $runner -PathType Leaf)) { Record 'missing_runner'; exit 11 }
  Record 'runner_start'
  & $cmd '/d' '/s' '/c' ('"' + $runner + '"')
  $result = $LASTEXITCODE
  if ($null -eq $result) { $result = 1 }
  Record ('runner_exit_' + $result)
} catch {
  Record ('launcher_error_' + $_.Exception.GetType().Name)
  $result = 1
} finally {
  Remove-Item Env:TOKEN_ENCRYPT_KEY -ErrorAction SilentlyContinue
}
exit $result
