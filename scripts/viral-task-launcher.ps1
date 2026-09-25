param()
$ErrorActionPreference = 'Stop'
$repo = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$session = Join-Path $env:USERPROFILE '.cj-mcp-token'
$configPath = Join-Path $env:USERPROFILE '.codex\config.toml'
$env:CJ_MCP_ENABLE = '0'
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
$cmd = Join-Path $env:SystemRoot 'System32\cmd.exe'
$runner = Join-Path $PSScriptRoot 'run-viral-loop.cmd'
if (-not (Test-Path -LiteralPath $cmd -PathType Leaf)) { throw 'cmd.exe missing' }
if (-not (Test-Path -LiteralPath $runner -PathType Leaf)) { throw 'viral runner missing' }
try {
  & $cmd '/d' '/s' '/c' ('"' + $runner + '"')
  $result = $LASTEXITCODE
  if ($null -eq $result) { $result = 1 }
} finally {
  Remove-Item Env:TOKEN_ENCRYPT_KEY -ErrorAction SilentlyContinue
}
exit $result
