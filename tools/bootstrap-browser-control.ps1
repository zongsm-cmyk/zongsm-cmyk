$ErrorActionPreference = "Stop"

$env:AGENT_BROWSER_VERSION = "v1.5.139"
$installer = "https://raw.githubusercontent.com/leeguooooo/chrome-use/main/install.ps1"
$chromeUseDir = Join-Path $env:LOCALAPPDATA "Programs\chrome-use"
$chromeUseExe = Join-Path $chromeUseDir "chrome-use.exe"

Write-Host "[1/5] Installing pinned chrome-use $env:AGENT_BROWSER_VERSION"
Invoke-RestMethod $installer | Invoke-Expression

# The official installer adds chrome-use to the user PATH for new terminals.
# Make the just-installed binary available in this current PowerShell process too.
if (-not (Test-Path $chromeUseExe)) {
  throw "chrome-use executable not found at $chromeUseExe"
}
if (($env:Path -split ';') -notcontains $chromeUseDir) {
  $env:Path = "$chromeUseDir;$env:Path"
}

Write-Host "[2/5] Verifying binary"
& $chromeUseExe --version

Write-Host "[3/5] Installing project skill"
& $chromeUseExe skill install --project

Write-Host "[4/5] Registering native-messaging host"
& $chromeUseExe extension install

Write-Host "[5/5] Checking local relay/extension status"
& $chromeUseExe status

Write-Host "If the Chrome extension itself is not installed yet, install the official chrome-use extension in Chrome, restart Chrome once, then run tools\smoke-browser-control.ps1"
