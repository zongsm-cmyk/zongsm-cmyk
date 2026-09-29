$ErrorActionPreference = "Stop"

$Root = Join-Path $env:LOCALAPPDATA "ALFAROUQ\BrowserStack"
$Downloads = Join-Path $Root "downloads"
$GooseDir = Join-Path $Root "goose"
$Logs = Join-Path $Root "logs"
$Tasks = Join-Path $Root "tasks"

$ChromeExe = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$ChromeUserData = Join-Path $env:LOCALAPPDATA "Google\Chrome\User Data"

$PlaywrightExtensionId = "mmlmfjhmonkocbjadbfplnigmagldckm"
$NanobrowserExtensionId = "imbddededgmcgfhfpcjmijokokekbkal"
$PlaywrightStore = "https://chromewebstore.google.com/detail/playwright-extension/$PlaywrightExtensionId"
$NanobrowserStore = "https://chromewebstore.google.com/detail/nanobrowser-ai-web-agent/$NanobrowserExtensionId"
$PlaywrightStatus = "chrome-extension://$PlaywrightExtensionId/status.html"

$GooseVersion = "1.52.0"
$GooseUrl = "https://github.com/aaif-goose/goose/releases/download/v1.52.0/goose-x86_64-pc-windows-msvc.zip"
$GooseSha256 = "13f51e2294a8c92ce440988beb1873ed688e33d8fc72c0f75755b2ed5b3d54bc"

function Step([string]$Text) {
  Write-Host ""
  Write-Host "=== $Text ===" -ForegroundColor Cyan
}

function Refresh-Path {
  $machine = [Environment]::GetEnvironmentVariable("Path", "Machine")
  $user = [Environment]::GetEnvironmentVariable("Path", "User")
  $env:Path = "$machine;$user"
}

function Get-NodeMajor {
  try {
    $v = (& node --version 2>$null).Trim()
    if ($v -match "^v(\d+)") { return [int]$Matches[1] }
  } catch {}
  return 0
}

function Find-ChromeExtension([string]$Id) {
  if (-not (Test-Path $ChromeUserData)) { return $false }
  $profiles = Get-ChildItem -Path $ChromeUserData -Directory -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -eq "Default" -or $_.Name -like "Profile *" }
  foreach ($p in $profiles) {
    if (Test-Path (Join-Path $p.FullName "Extensions\$Id")) { return $true }
  }
  return $false
}

function Open-Chrome([string]$Url) {
  if (Test-Path $ChromeExe) {
    Start-Process -FilePath $ChromeExe -ArgumentList $Url
  } else {
    Start-Process $Url
  }
}

New-Item -ItemType Directory -Force -Path $Root,$Downloads,$GooseDir,$Logs,$Tasks | Out-Null

Step "1. Verify local Ollama and select a local model"
try {
  $tags = Invoke-RestMethod -Uri "http://127.0.0.1:11434/api/tags" -Method Get -TimeoutSec 10
} catch {
  throw "Ollama is not reachable at http://127.0.0.1:11434. Start Ollama, then run this installer again."
}
$names = @($tags.models | ForEach-Object { $_.name })
$preferred = @("qwen3.5:9b-q4_K_M","qwen3.5:9b","qwen3.5:4b","qwen2.5:14b")
$Model = $null
foreach ($p in $preferred) {
  $hit = $names | Where-Object { $_ -eq $p -or $_ -like "$p*" } | Select-Object -First 1
  if ($hit) { $Model = $hit; break }
}
if (-not $Model) {
  $Model = $names | Where-Object { $_ -match "qwen" } | Select-Object -First 1
}
if (-not $Model) { throw "No local Qwen model was found in Ollama." }
Write-Host "Local model: $Model" -ForegroundColor Green

Step "2. Ensure Node.js 20+ for Playwright MCP"
$major = Get-NodeMajor
if ($major -lt 20) {
  $winget = Get-Command winget.exe -ErrorAction SilentlyContinue
  if (-not $winget) {
    throw "Node.js 20+ is required and winget is not available. Install Node.js LTS, then rerun."
  }
  Write-Host "Installing Node.js LTS with winget..." -ForegroundColor Yellow
  & winget install -e --id OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements
  if ($LASTEXITCODE -ne 0) { throw "Node.js installation failed with exit code $LASTEXITCODE." }
  Refresh-Path
  $major = Get-NodeMajor
}
if ($major -lt 20) { throw "Node.js 20+ is still not available after installation." }
Write-Host ("Node: " + (& node --version)) -ForegroundColor Green
Write-Host ("npx: " + (& npx --version)) -ForegroundColor Green

Step "3. Validate official Playwright MCP package"
$help = & npx.cmd -y @playwright/mcp@latest --help 2>&1 | Out-String
if ($LASTEXITCODE -ne 0 -or $help -notmatch "--extension") {
  throw "Playwright MCP validation failed."
}
Write-Host "Playwright MCP package is ready." -ForegroundColor Green

Step "4. Install pinned Goose CLI"
$GooseZip = Join-Path $Downloads "goose-v$GooseVersion-windows.zip"
if (-not (Test-Path $GooseZip) -or ((Get-FileHash $GooseZip -Algorithm SHA256).Hash.ToLower() -ne $GooseSha256)) {
  Write-Host "Downloading Goose v$GooseVersion..." -ForegroundColor Yellow
  Invoke-WebRequest -UseBasicParsing -Uri $GooseUrl -OutFile $GooseZip
}
$hash = (Get-FileHash $GooseZip -Algorithm SHA256).Hash.ToLower()
if ($hash -ne $GooseSha256) { throw "Goose archive SHA256 mismatch." }

$Extract = Join-Path $Downloads "goose-extract"
Remove-Item -Recurse -Force $Extract -ErrorAction SilentlyContinue
Expand-Archive -Path $GooseZip -DestinationPath $Extract -Force
$foundGoose = Get-ChildItem -Path $Extract -Filter "goose.exe" -File -Recurse | Select-Object -First 1
if (-not $foundGoose) { throw "goose.exe was not found in the official archive." }
Remove-Item -Recurse -Force $GooseDir -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force -Path $GooseDir | Out-Null
Copy-Item -Path (Join-Path $foundGoose.Directory.FullName "*") -Destination $GooseDir -Recurse -Force
$GooseExe = Join-Path $GooseDir "goose.exe"
if (-not (Test-Path $GooseExe)) { throw "Goose installation failed." }
& $GooseExe --version | Out-Host

Step "5. Bind to the active Chrome profile"
$profileDir = $null
$localState = Join-Path $ChromeUserData "Local State"
if (Test-Path $localState) {
  try {
    $json = Get-Content -Raw -Path $localState | ConvertFrom-Json
    $profileDir = $json.profile.last_used
  } catch {}
}
if (-not $profileDir) { $profileDir = "Default" }
Write-Host "Chrome profile: $profileDir" -ForegroundColor Green

[Environment]::SetEnvironmentVariable("GOOSE_PROVIDER","ollama","User")
[Environment]::SetEnvironmentVariable("GOOSE_MODEL",$Model,"User")
[Environment]::SetEnvironmentVariable("OLLAMA_HOST","http://127.0.0.1:11434","User")
[Environment]::SetEnvironmentVariable("OLLAMA_CONTEXT_LENGTH","16384","User")
[Environment]::SetEnvironmentVariable("PLAYWRIGHT_MCP_PROFILE_DIR_NAME",$profileDir,"User")
$env:GOOSE_PROVIDER = "ollama"
$env:GOOSE_MODEL = $Model
$env:OLLAMA_HOST = "http://127.0.0.1:11434"
$env:OLLAMA_CONTEXT_LENGTH = "16384"
$env:PLAYWRIGHT_MCP_PROFILE_DIR_NAME = $profileDir

Step "6. Install the two Chrome extensions once"
if (-not (Find-ChromeExtension $PlaywrightExtensionId)) { Open-Chrome $PlaywrightStore }
if (-not (Find-ChromeExtension $NanobrowserExtensionId)) { Open-Chrome $NanobrowserStore }

if (-not (Find-ChromeExtension $PlaywrightExtensionId) -or -not (Find-ChromeExtension $NanobrowserExtensionId)) {
  Write-Host ""
  Write-Host "ONE-TIME HUMAN STEP:" -ForegroundColor Yellow
  Write-Host "In Chrome, click Add to Chrome for Playwright Extension and Nanobrowser." -ForegroundColor Yellow
  Write-Host "This installer will detect them automatically." -ForegroundColor Yellow

  $deadline = (Get-Date).AddMinutes(10)
  do {
    Start-Sleep -Seconds 3
    $pwReady = Find-ChromeExtension $PlaywrightExtensionId
    $nanoReady = Find-ChromeExtension $NanobrowserExtensionId
  } while ((-not $pwReady -or -not $nanoReady) -and (Get-Date) -lt $deadline)
}
if (-not (Find-ChromeExtension $PlaywrightExtensionId)) { throw "Playwright Extension was not detected." }
if (-not (Find-ChromeExtension $NanobrowserExtensionId)) { throw "Nanobrowser was not detected." }
Write-Host "Both Chrome extensions are installed." -ForegroundColor Green

Step "7. Configure Playwright auto-connect token once"
$existingToken = [Environment]::GetEnvironmentVariable("PLAYWRIGHT_MCP_EXTENSION_TOKEN","User")
if ([string]::IsNullOrWhiteSpace($existingToken)) {
  Open-Chrome $PlaywrightStatus
  Write-Host ""
  Write-Host "ONE-TIME HUMAN STEP:" -ForegroundColor Yellow
  Write-Host "The Playwright Extension status page is open." -ForegroundColor Yellow
  Write-Host "Copy the PLAYWRIGHT_MCP_EXTENSION_TOKEN line shown there and paste it below." -ForegroundColor Yellow
  $line = Read-Host "Paste token line"
  if ($line -match "^PLAYWRIGHT_MCP_EXTENSION_TOKEN=(.+)$") {
    $token = $Matches[1].Trim()
  } else {
    $token = $line.Trim()
  }
  if ($token -notmatch "^[A-Za-z0-9_-]{40,60}$") {
    throw "The Playwright extension token format is not valid."
  }
  [Environment]::SetEnvironmentVariable("PLAYWRIGHT_MCP_EXTENSION_TOKEN",$token,"User")
  $env:PLAYWRIGHT_MCP_EXTENSION_TOKEN = $token
} else {
  $env:PLAYWRIGHT_MCP_EXTENSION_TOKEN = $existingToken
  Write-Host "Existing Playwright extension token found." -ForegroundColor Green
}

Step "8. Create launchers and guard policy"
$Policy = @"
ALFAROUQ CLEAN BROWSER STACK v1

PRIMARY PATH:
Goose local planner + Ollama/Qwen
  -> Playwright MCP
  -> official Playwright Extension
  -> existing logged-in Chrome profile

FALLBACK:
Nanobrowser + Ollama, installed but idle by default.

ONE BROWSER OWNER:
- Never run Nanobrowser automation while Goose/Playwright is controlling Chrome.
- Never run chrome-use automation in parallel.
- chrome-use is deprecated for production use in this stack.
- Human intervention only for MFA, CAPTCHA, identity verification, payment confirmation, or irreversible personal decisions.

GUARDS:
- max identical tool repetitions: 2
- bounded turns
- no live payment/store activation unless the user explicitly requests it
- stop after authoritative success
"@
Set-Content -Path (Join-Path $Root "POLICY.txt") -Value $Policy -Encoding UTF8

$AgentCmd = @"
@echo off
title ALFAROUQ Browser Agent
set "GOOSE_PROVIDER=ollama"
set "GOOSE_MODEL=$Model"
set "OLLAMA_HOST=http://127.0.0.1:11434"
set "OLLAMA_CONTEXT_LENGTH=16384"
"$GooseExe" session --no-profile --with-extension "playwright:npx -y @playwright/mcp@latest --extension" --max-tool-repetitions 2 --max-turns 60 --system "Use Playwright as the only browser owner. Reuse the existing Chrome profile. Never use coordinate clicking. Stop for MFA, CAPTCHA, identity verification, real payment confirmation, or irreversible personal decisions. Never repeat the same failed browser action more than twice."
"@
Set-Content -Path (Join-Path $Root "ALFAROUQ_BROWSER_AGENT.cmd") -Value $AgentCmd -Encoding ASCII

$LemonTask = @"
Use only the Playwright MCP browser tools and the existing logged-in Chrome profile.

Goal: finish Reliable Forms Notify Pro in Lemon Squeezy TEST MODE.

Required state:
1. Open Lemon Squeezy products.
2. Create or continue the product named Reliable Forms Notify Pro.
3. Configure subscription pricing with exactly two variants:
   - Monthly: USD 3.99, recurring every 1 month.
   - Annual: USD 29.99, recurring every 1 year.
4. Enable software license keys for both variants.
5. Set activation limit to 1.
6. Publish/save only in TEST MODE.

Safety:
- Do not activate the live store.
- Do not enter real card or bank data.
- Do not perform identity verification.
- Do not change unrelated account settings.
- If MFA, CAPTCHA, identity verification, payment confirmation, or another irreversible gate appears, stop and ask for human action.
- After each material action, verify the page state before continuing.
- Never repeat the same unsuccessful action more than twice.
- Stop immediately once the authoritative page state confirms the test-mode product and variants are saved.
"@
Set-Content -Path (Join-Path $Tasks "lemonsqueezy.md") -Value $LemonTask -Encoding UTF8

$LemonCmd = @"
@echo off
title ALFAROUQ - Lemon Squeezy
set "GOOSE_PROVIDER=ollama"
set "GOOSE_MODEL=$Model"
set "OLLAMA_HOST=http://127.0.0.1:11434"
set "OLLAMA_CONTEXT_LENGTH=16384"
"$GooseExe" run --provider ollama --model "$Model" --no-profile --with-extension "playwright:npx -y @playwright/mcp@latest --extension" --max-tool-repetitions 2 --max-turns 50 --no-session -i "$Tasks\lemonsqueezy.md"
pause
"@
Set-Content -Path (Join-Path $Root "RUN_LEMONSQUEEZY.cmd") -Value $LemonCmd -Encoding ASCII

$Desktop = [Environment]::GetFolderPath("Desktop")
Copy-Item (Join-Path $Root "ALFAROUQ_BROWSER_AGENT.cmd") (Join-Path $Desktop "ALFAROUQ Browser Agent.cmd") -Force
Copy-Item (Join-Path $Root "RUN_LEMONSQUEEZY.cmd") (Join-Path $Desktop "ALFAROUQ Lemon Squeezy.cmd") -Force

Step "9. End-to-end smoke test"
$smokeArgs = @(
  "run",
  "--provider","ollama",
  "--model",$Model,
  "--no-profile",
  "--with-extension","playwright:npx -y @playwright/mcp@latest --extension",
  "--max-tool-repetitions","2",
  "--max-turns","12",
  "--no-session",
  "-t","Use Playwright only. Navigate the connected Chrome tab to https://example.com, read the page title, then stop. Do not modify anything else."
)
$smokeOutput = & $GooseExe @smokeArgs 2>&1 | Out-String
$smokeOutput | Set-Content -Path (Join-Path $Logs "smoke.txt") -Encoding UTF8
if ($LASTEXITCODE -ne 0) {
  Write-Host "Smoke test did not complete. The stack is installed; see $Logs\smoke.txt" -ForegroundColor Yellow
} else {
  Write-Host "Smoke test completed." -ForegroundColor Green
}

Step "SETUP COMPLETE"
Write-Host "Primary owner: Goose/Ollama -> Playwright MCP -> Playwright Extension -> Chrome" -ForegroundColor Green
Write-Host "Fallback: Nanobrowser is installed but should stay idle unless explicitly used." -ForegroundColor Green
Write-Host "Desktop launcher created: ALFAROUQ Browser Agent.cmd" -ForegroundColor Green
Write-Host "Desktop task launcher created: ALFAROUQ Lemon Squeezy.cmd" -ForegroundColor Green
Write-Host ""
Write-Host "For the current task, run ALFAROUQ Lemon Squeezy.cmd." -ForegroundColor Cyan
