$ErrorActionPreference = "Stop"

Write-Host "[1/4] chrome-use health"
chrome-use status

Write-Host "[2/4] Load core browser skill"
chrome-use skills get core | Out-Null

Write-Host "[3/4] Open safe test page in the single ALFAROUQ session"
chrome-use --session ALFAROUQ open https://example.com

Write-Host "[4/4] Read interactive state"
chrome-use --session ALFAROUQ snapshot -i

Write-Host "PASS candidate: chrome-use can control the single ALFAROUQ browser session."
