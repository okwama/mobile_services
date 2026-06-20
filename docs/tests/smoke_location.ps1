param(
  [string]$Query = 'Nairobi'
)

$API_BASE = $env:API_BASE
if (-not $API_BASE) { $API_BASE = 'https://gateway.aircharterss.com/api' }

$url = "$API_BASE/locations/search?q=$Query"
Write-Host "Testing: $url"

try {
  $response = Invoke-RestMethod -Uri $url -Method Get -Headers @{ Accept = 'application/json' } -ErrorAction Stop
  Write-Host "OK (200)"
  $response | ConvertTo-Json -Depth 5
  exit 0
} catch {
  Write-Host "Request failed:`n$($_.Exception.Message)"
  exit 2
}
