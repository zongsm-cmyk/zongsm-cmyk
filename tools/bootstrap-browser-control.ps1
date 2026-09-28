$ErrorActionPreference = "Stop"

$env:AGENT_BROWSER_VERSION = "v1.5.139"
$installer = "https://raw.githubusercontent.com/leeguooooo/chrome-use/main/install.ps1"

Write-Host "[1/5] Installing pinned chrome-use $env:AGENT_BROWSER_VERSION"
Invoke-RestMethod $installer | Invoke-Expression

Write-Host "[2/5] Verifying binary"
chrome-use --version

Write-Host "[3/5] Installing project skill"
chrome-use skill install --project

Write-Host "[4/5] Checking local relay/extension status"
chrome-use status

Write-Host "[5/5] Browser extension connection"
Write-Host "If status says the extension is not connected, run: chrome-use extension connect"
Write-Host "After the extension is connected, run tools\smoke-browser-control.ps1"
