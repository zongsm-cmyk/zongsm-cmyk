
$ErrorActionPreference = "Stop"
$Session = "ALFAROUQ"
$ChromeUseVersion = "v1.5.139"
$ChromeUseDir = Join-Path $env:LOCALAPPDATA "Programs\chrome-use"
$ChromeUseExe = Join-Path $ChromeUseDir "chrome-use.exe"
$WebStoreUrl = "https://chromewebstore.google.com/detail/chrome-use/knfcmbamhjmaonkfnjhldjedeobeafmk"
$Ollama = "http://127.0.0.1:11434"
$env:AGENT_BROWSER_SETTLE_MS = "8000"

$Task = @"
Use the user's existing logged-in Chrome and Lemon Squeezy TEST MODE only.
Create product: Reliable Forms Notify Pro.
Subscription variants:
- Monthly: USD 3.99, every 1 month.
- Annual: USD 29.99, every 1 year.
Enable Generate license keys for both variants and set activation limit to 1.
Publish the product in TEST MODE.
Never activate the live store. Never enter real payment details. Never perform identity verification.
If CAPTCHA, MFA/2FA, identity verification, or any irreversible real-money action appears, request human action.
After successful test-mode publication, stop.
"@

function Step($m) {
  Write-Host ""
  Write-Host "=== $m ===" -ForegroundColor Cyan
}

function Ensure-ChromeUse {
  if (-not (Test-Path $ChromeUseExe)) {
    Step "Installing chrome-use"
    $env:AGENT_BROWSER_VERSION = $ChromeUseVersion
    Invoke-RestMethod "https://raw.githubusercontent.com/leeguooooo/chrome-use/main/install.ps1" | Invoke-Expression
  }
  if (-not (Test-Path $ChromeUseExe)) { throw "chrome-use installation failed." }
  if (($env:Path -split ';') -notcontains $ChromeUseDir) {
    $env:Path = "$ChromeUseDir;$env:Path"
  }
  & $ChromeUseExe --version | Out-Host
}

function Ensure-OllamaModel {
  Step "Checking local Ollama"
  try {
    $tags = Invoke-RestMethod -Uri "$Ollama/api/tags" -Method Get -TimeoutSec 8
  } catch {
    throw "Ollama is not running. Start Ollama once, then run this launcher again."
  }
  $names = @($tags.models | ForEach-Object { $_.name })
  $preferred = @("qwen3.5:9b-q4_K_M","qwen3.5:9b","qwen3.5:4b","qwen2.5:14b")
  foreach ($p in $preferred) {
    $hit = $names | Where-Object { $_ -eq $p -or $_ -like "$p*" } | Select-Object -First 1
    if ($hit) { return $hit }
  }
  $qwen = $names | Where-Object { $_ -match "qwen" } | Select-Object -First 1
  if ($qwen) { return $qwen }
  throw "No local Qwen model found in Ollama."
}

function RunCU {
  param([string[]]$CommandArgs)
  $old = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  try {
    $out = & $ChromeUseExe --session $Session @CommandArgs 2>&1 | Out-String
    $code = $LASTEXITCODE
    [pscustomobject]@{ Code=$code; Text=$out }
  } finally {
    $ErrorActionPreference = $old
  }
}

function Ensure-Extension {
  Step "Registering chrome-use native host"
  $old = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  try {
    $installText = & $ChromeUseExe extension install 2>&1 | Out-String
    if ($installText) { Write-Host $installText }
  } finally {
    $ErrorActionPreference = $old
  }
  Write-Host "Extension is installed. The first chrome-use open command will establish the relay." -ForegroundColor Green
}

function Snapshot {
  $last = $null
  foreach ($settle in @(4000,8000,12000)) {
    $last = RunCU -CommandArgs @("snapshot","-i","--settle-ms",[string]$settle)
    if ($last.Code -eq 0) { return $last.Text }
    if ($last.Text -notmatch "had not settled|request in flight|mid-transition") { break }
    Start-Sleep -Milliseconds 900
  }
  throw ("Snapshot failed after settle retries: " + $last.Text)
}

function AskLocalModel {
  param([string]$Model,[string]$Snapshot,[string]$History)
  $sys = @"
You are ALFAROUQ's local browser controller.
Choose exactly ONE next browser action from the CURRENT chrome-use accessibility snapshot.
Return JSON only.

Allowed:
{"action":"click","target":"@eN","value":"","reason":"short"}
{"action":"fill","target":"@eN","value":"text","reason":"short"}
{"action":"press","target":"","value":"Enter","reason":"short"}
{"action":"wait","target":"","value":"1500","reason":"short"}
{"action":"done","target":"","value":"","reason":"authoritative success signal"}
{"action":"need_human","target":"","value":"","reason":"MFA/CAPTCHA/identity/real payment only"}

Rules:
- Use only refs from the CURRENT snapshot.
- Never use coordinates.
- Never activate Lemon Squeezy live mode.
- Never enter real payment details.
- Never perform identity verification.
- Test-mode publication is allowed.
- Prefer safe reversible actions.
- Stop after an authoritative success signal.
- NEVER repeat the same action on the same target when history says it produced no state change.
- If a click on a radio/button/select does not change the snapshot, choose a different visible ref for the same control, or use keyboard activation only if the clicked control currently has focus.
- Treat "NO_STATE_CHANGE" and "REPEATED_ACTION_BLOCKED" in history as hard constraints.
"@

  $user = "TASK:" + [Environment]::NewLine + $Task + [Environment]::NewLine +
          "RECENT HISTORY:" + [Environment]::NewLine + $History + [Environment]::NewLine +
          "CURRENT SNAPSHOT:" + [Environment]::NewLine + $Snapshot

  $body = @{
    model = $Model
    stream = $false
    format = "json"
    options = @{ temperature = 0 }
    messages = @(
      @{ role="system"; content=$sys },
      @{ role="user"; content=$user }
    )
  } | ConvertTo-Json -Depth 8

  $resp = Invoke-RestMethod -Uri "$Ollama/api/chat" -Method Post -ContentType "application/json" -Body $body -TimeoutSec 120
  $resp.message.content | ConvertFrom-Json
}

function DoAction($a) {
  switch ($a.action) {
    "click" {
      if ($a.target -notmatch '^@e\d+$') { throw ("Unsafe click target: " + $a.target) }
      RunCU -CommandArgs @("click",[string]$a.target,"--observe")
    }
    "fill" {
      if ($a.target -notmatch '^@e\d+$') { throw ("Unsafe fill target: " + $a.target) }
      RunCU -CommandArgs @("fill",[string]$a.target,[string]$a.value)
    }
    "press" {
      RunCU -CommandArgs @("press",[string]$a.value)
    }
    "wait" {
      $ms = 1500
      $parsed = 0
      if ([int]::TryParse(([string]$a.value), [ref]$parsed)) { $ms = $parsed }
      if ($ms -lt 250) { $ms = 250 }
      if ($ms -gt 5000) { $ms = 5000 }
      Start-Sleep -Milliseconds $ms
      [pscustomobject]@{Code=0;Text=("waited " + $ms + " ms")}
    }
    default { throw ("Unsupported action: " + $a.action) }
  }
}

try {
  Step "ALFAROUQ local browser automation"
  Ensure-ChromeUse
  $Model = Ensure-OllamaModel
  Write-Host ("Using local model: " + $Model) -ForegroundColor Green
  Ensure-Extension

  Step "Opening Lemon Squeezy Products through the installed extension"
  $open = $null
  for ($i=0; $i -lt 6; $i++) {
    $open = RunCU -CommandArgs @("open","https://app.lemonsqueezy.com/products")
    if ($open.Code -eq 0) { break }
    Start-Sleep -Seconds 5
  }
  if ($open.Code -ne 0) {
    throw ("chrome-use open could not establish the extension relay. Click the chrome-use robot icon once in Chrome, then run V7 again. Last error: " + $open.Text)
  }
  Start-Sleep -Seconds 3

  $history = ""
  $lastSignature = ""
  $sameSignatureCount = 0
  for ($step=1; $step -le 40; $step++) {
    Step ("Automation step " + $step)
    $snap = Snapshot
    $a = AskLocalModel -Model $Model -Snapshot $snap -History $history
    Write-Host ("Action: " + $a.action + " target=" + $a.target + " value=" + $a.value + " - " + $a.reason)

    $signature = ([string]$a.action) + "|" + ([string]$a.target) + "|" + ([string]$a.value)
    if ($signature -eq $lastSignature) {
      $sameSignatureCount++
    } else {
      $sameSignatureCount = 0
      $lastSignature = $signature
    }

    if ($sameSignatureCount -ge 2 -and $a.action -notin @("wait","done","need_human")) {
      $history += [Environment]::NewLine + ("REPEATED_ACTION_BLOCKED: " + $signature + " was proposed repeatedly. Choose a different ref or interaction method.")
      Start-Sleep -Milliseconds 700
      continue
    }

    if ($a.action -eq "done") {
      Write-Host ""
      Write-Host "SUCCESS: Test-mode product workflow completed." -ForegroundColor Green
      & $ChromeUseExe --session $Session get url 2>&1 | Out-Host
      exit 0
    }

    if ($a.action -eq "need_human") {
      Write-Host ""
      Write-Host ("HUMAN-ONLY STEP: " + $a.reason) -ForegroundColor Yellow
      Write-Host "Complete only that one item in Chrome, then press ENTER here." -ForegroundColor Yellow
      Read-Host | Out-Null
      $history += [Environment]::NewLine + ("step " + $step + ": human gate completed")
      continue
    }

    $beforeSnap = $snap
    $r = DoAction $a
    if ($r.Code -ne 0) {
      $history += [Environment]::NewLine + ("step " + $step + " failed: " + $r.Text)
      Start-Sleep -Seconds 1
      continue
    }

    $short = ($r.Text -replace '\s+',' ')
    if ($short.Length -gt 500) { $short = $short.Substring(0,500) }

    Start-Sleep -Milliseconds 900
    $afterSnap = ""
    try { $afterSnap = Snapshot } catch { $afterSnap = "" }

    if ($afterSnap -and ($afterSnap -eq $beforeSnap) -and $a.action -notin @("wait","press")) {
      $history += [Environment]::NewLine + ("NO_STATE_CHANGE: " + $signature + " completed but snapshot stayed identical. Do not repeat this exact interaction.")
    } else {
      $history += [Environment]::NewLine + ("step " + $step + ": " + $a.action + " " + $a.target + " " + $a.value + " -> " + $short)
    }

    if ($history.Length -gt 5000) { $history = $history.Substring($history.Length - 5000) }
    Start-Sleep -Milliseconds 700
  }

  throw "Reached the 40-step safety limit without a confirmed success signal."
}
catch {
  Write-Host ""
  Write-Host ("STOPPED SAFELY: " + $_.Exception.Message) -ForegroundColor Red
  Write-Host "No live-store activation or real payment action was permitted." -ForegroundColor Yellow
  try {
    $desk = [Environment]::GetFolderPath("Desktop")
    $log = Join-Path $desk "ALFAROUQ_BROWSER_LAST_STATE.txt"
    $statusText = & $ChromeUseExe status 2>&1 | Out-String
    $snapText = Snapshot
    $content = "ERROR:" + [Environment]::NewLine + $_.Exception.Message + [Environment]::NewLine +
               [Environment]::NewLine + "STATUS:" + [Environment]::NewLine + $statusText +
               [Environment]::NewLine + "SNAPSHOT:" + [Environment]::NewLine + $snapText
    $content | Set-Content -Path $log -Encoding UTF8
    Write-Host ("Diagnostic saved to: " + $log)
  } catch {}
  exit 1
}
