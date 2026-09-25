$ErrorActionPreference='Stop'
$launcher = Join-Path $PSScriptRoot 'viral-task-launcher.ps1'
$runner = Join-Path $PSScriptRoot 'run-viral-loop.cmd'
$tokens=$null;$errors=$null
[System.Management.Automation.Language.Parser]::ParseFile($launcher,[ref]$tokens,[ref]$errors) | Out-Null
if($errors.Count -gt 0){throw ('Launcher parse errors: '+($errors.Message -join '; '))}
$l=Get-Content $launcher -Raw
$r=Get-Content $runner -Raw
foreach($needle in @('System32\cmd.exe','run-viral-loop.cmd','CJ_MCP_ENABLE','TOKEN_ENCRYPT_KEY','Remove-Item Env:TOKEN_ENCRYPT_KEY')){
  if(-not $l.Contains($needle)){throw ('Missing launcher safeguard: '+$needle)}
}
foreach($needle in @('LOCALAPPDATA','PrismBay','viral-refresh.log','mkdir "%LOGDIR%"','git pull --rebase origin main','render-viral-queue.mjs')){
  if(-not $r.Contains($needle)){throw ('Missing runner safeguard: '+$needle)}
}
if($r.Contains('C:\PrismBayViral.log')){throw 'Runner must not depend on protected C:\ root logging'}
if($l -match "&\s+\(Join-Path.+run-viral-loop[.]cmd"){throw 'Launcher must invoke cmd.exe explicitly for .cmd reliability'}
Write-Output 'PASS: viral task launcher and runner safeguards'
