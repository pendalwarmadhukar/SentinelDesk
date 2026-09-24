$body = '{"alertId":"ALT-1024","prompt":"List top 3 MITRE ATT&CK techniques and containment steps."}'
$response = Invoke-RestMethod -Uri 'http://localhost:3000/api/ai/analyze-alert' -Method Post -Body $body -ContentType 'application/json'
Write-Host "=== GEMINI AI RESPONSE ==="
Write-Host $response.analysis
Write-Host "=== MODEL: $($response.model) ==="
