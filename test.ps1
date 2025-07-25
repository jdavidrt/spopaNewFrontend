# SS Admin Microservice Performance Test - Laboratory 4 (FAST VERSION)
# Testing through API Gateway with Load Balancing - Single Run Per User Count
# Copy and paste this entire block into PowerShell

$BaseUrl = "http://localhost:8080"  # API Gateway
$Endpoint = "/api/offers"
$FullUrl = "$BaseUrl$Endpoint"
$UserCounts = @(1, 5, 50, 75, 100, 500, 750, 1000, 2000)

Write-Host "SS Admin Microservice Performance Test (Load Balanced - FAST)" -ForegroundColor Green
Write-Host "=============================================================" -ForegroundColor Green
Write-Host "Single run per user count for faster results" -ForegroundColor Cyan

# Check service accessibility
try {
    $HealthResponse = Invoke-WebRequest -Uri "$BaseUrl/health" -UseBasicParsing -TimeoutSec 5
    $HealthData = $HealthResponse.Content | ConvertFrom-Json
    Write-Host "✓ API Gateway accessible - Load balancing $($HealthData.availableServices) instances" -ForegroundColor Green
} catch {
    Write-Host "ERROR: API Gateway not accessible at $BaseUrl" -ForegroundColor Red
    return
}

# Fast performance test function
function Run-FastTest {
    param([int]$Users)
    
    Write-Host "Testing $Users users..." -ForegroundColor Yellow
    
    # Adaptive request count - fewer requests for more users to speed up test
    $RequestsPerUser = if ($Users -le 10) { 5 } 
                      elseif ($Users -le 100) { 3 } 
                      else { 2 }
    
    $StartTime = Get-Date
    $Jobs = @()
    
    for ($i = 1; $i -le $Users; $i++) {
        $Job = Start-Job -ScriptBlock {
            param($Url, $RequestCount)
            $Times = @()
            $Success = 0
            
            for ($j = 1; $j -le $RequestCount; $j++) {
                try {
                    $Start = Get-Date
                    $Response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 15
                    $End = Get-Date
                    
                    if ($Response.StatusCode -eq 200) {
                        $Times += ($End - $Start).TotalMilliseconds
                        $Success++
                    }
                } catch {
                    # Request failed - continue
                }
            }
            
            return @{ Times = $Times; Success = $Success }
        } -ArgumentList $FullUrl, $RequestsPerUser
        
        $Jobs += $Job
    }
    
    $AllTimes = @()
    $TotalSuccess = 0
    
    foreach ($Job in $Jobs) {
        $Result = Receive-Job -Job $Job -Wait
        $AllTimes += $Result.Times
        $TotalSuccess += $Result.Success
        Remove-Job -Job $Job
    }
    
    $EndTime = Get-Date
    $TestTimeMinutes = ($EndTime - $StartTime).TotalMinutes
    
    $AvgResponseTime = if ($AllTimes.Count -gt 0) { ($AllTimes | Measure-Object -Average).Average } else { 0 }
    $ThroughputPerMin = if ($TestTimeMinutes -gt 0) { $TotalSuccess / $TestTimeMinutes } else { 0 }
    $ErrorRate = (($Users * $RequestsPerUser - $TotalSuccess) / ($Users * $RequestsPerUser)) * 100
    
    Write-Host "  Response: $([math]::Round($AvgResponseTime, 1))ms | Throughput: $([math]::Round($ThroughputPerMin, 1)) trans/min | Errors: $([math]::Round($ErrorRate, 1))%" -ForegroundColor Cyan
    
    return @{
        Users = $Users
        ResponseTime = $AvgResponseTime
        Throughput = $ThroughputPerMin
        ErrorRate = $ErrorRate
        TestTime = $TestTimeMinutes
    }
}

# Run all tests (single run each)
Write-Host "Running fast load-balanced performance tests..." -ForegroundColor Green
$AllResults = @()

foreach ($UserCount in $UserCounts) {
    $Result = Run-FastTest -Users $UserCount
    $AllResults += $Result
    
    # Quick pause between tests
    Start-Sleep -Milliseconds 500
}

# Generate results table
Write-Host ""
Write-Host "FAST PERFORMANCE TEST RESULTS - LOAD BALANCED" -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Yellow

$TableFormat = "{0,-12} {1,-20} {2,-20} {3,-15}"
Write-Host ($TableFormat -f "# Usuarios", "Tiempo Respuesta (ms)", "Throughput (trans/min)", "Error Rate %") -ForegroundColor Cyan
Write-Host ("-" * 75) -ForegroundColor Gray

$SummaryData = @()
foreach ($Result in $AllResults) {
    Write-Host ($TableFormat -f 
        $Result.Users,
        [math]::Round($Result.ResponseTime, 1),
        [math]::Round($Result.Throughput, 1),
        [math]::Round($Result.ErrorRate, 1)
    )
    
    $SummaryData += [PSCustomObject]@{
        'Usuarios' = $Result.Users
        'Tiempo_Respuesta_ms' = [math]::Round($Result.ResponseTime, 1)
        'Throughput_trans_min' = [math]::Round($Result.Throughput, 1)
        'Error_Rate_Percent' = [math]::Round($Result.ErrorRate, 1)
    }
}

# Export to CSV
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$SummaryData | Export-Csv -Path "performance_fast_loadbalanced_$Timestamp.csv" -NoTypeInformation

# Quick analysis
Write-Host ""
Write-Host "QUICK ANALYSIS:" -ForegroundColor Green

# Find knee point (where errors start or response time spikes)
$KneePoint = $null
for ($i = 1; $i -lt $AllResults.Count; $i++) {
    $Current = $AllResults[$i]
    $Previous = $AllResults[$i-1]
    
    # Knee point: error rate > 5% OR response time doubles
    if ($Current.ErrorRate -gt 5 -or $Current.ResponseTime -gt ($Previous.ResponseTime * 2)) {
        $KneePoint = $Current.Users
        break
    }
}

if ($KneePoint) {
    Write-Host "Knee Point: ~$KneePoint concurrent users" -ForegroundColor Red
} else {
    Write-Host "Knee Point: Not reached - system handled all loads!" -ForegroundColor Green
}

# Performance highlights
$BestThroughput = ($AllResults | Sort-Object Throughput -Descending)[0]
$LowestResponse = ($AllResults | Where-Object { $_.ErrorRate -lt 1 } | Sort-Object ResponseTime)[0]

Write-Host "Best Throughput: $([math]::Round($BestThroughput.Throughput, 1)) trans/min at $($BestThroughput.Users) users" -ForegroundColor Yellow
if ($LowestResponse) {
    Write-Host "Best Response Time: $([math]::Round($LowestResponse.ResponseTime, 1))ms at $($LowestResponse.Users) users" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "CSV exported: performance_fast_loadbalanced_$Timestamp.csv" -ForegroundColor Green
Write-Host ""
Write-Host "FAST TESTING COMPLETED in ~$(($AllResults | Measure-Object TestTime -Sum).Sum.ToString('F1')) minutes!" -ForegroundColor Green