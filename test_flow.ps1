# Call Flow Test Script - Windows PowerShell
# Bu script call flow ni to'liq test qiladi

$BASE_URL = "http://localhost:3000"
$REMOTE_HOST = "193.149.16.138"

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Call Flow Test - Boshlandi" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: File yuklash
Write-Host "Test 1: File yuklash" -ForegroundColor Yellow
Write-Host "Creating test numbers.txt file..."

# Create test numbers.txt
$testNumbers = @"
+998901234567
+998909876543
+998971112233
+998905554433
+998972223344
"@

$testNumbers | Out-File -FilePath "test_numbers.txt" -Encoding UTF8
Write-Host "✅ test_numbers.txt yaratildi" -ForegroundColor Green
Write-Host ""

# Upload file
Write-Host "Uploading file to API..."

try {
    $filePath = "test_numbers.txt"
    $boundary = [System.Guid]::NewGuid().ToString()
    $LF = "`r`n"

    $bodyLines = (
        "--$boundary",
        "Content-Disposition: form-data; name=`"file`"; filename=`"test_numbers.txt`"",
        "Content-Type: text/plain$LF",
        (Get-Content $filePath -Raw),
        "--$boundary--$LF"
    ) -join $LF

    $uploadResponse = Invoke-RestMethod -Uri "$BASE_URL/calls/upload" `
        -Method Post `
        -ContentType "multipart/form-data; boundary=$boundary" `
        -Body $bodyLines

    Write-Host "Response: $($uploadResponse | ConvertTo-Json)" -ForegroundColor Gray
    Write-Host ""

    if ($uploadResponse.ok -eq $true) {
        Write-Host "✅ File yuklash muvaffaqiyatli" -ForegroundColor Green
    } else {
        Write-Host "❌ File yuklash xato" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ File yuklash xato: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan

# Test 2: Remote serverda faylni tekshirish
Write-Host "Test 2: Remote serverda numbers.txt tekshirish" -ForegroundColor Yellow
Write-Host "Note: SSH tekshirish uchun qo'lda test qiling:"
Write-Host "  ssh root@$REMOTE_HOST 'cat /usr/src/call/numbers.txt'" -ForegroundColor Gray
Write-Host ""

Write-Host "==================================" -ForegroundColor Cyan

# Test 3: Call start
Write-Host "Test 3: Call process start" -ForegroundColor Yellow
Write-Host "Starting call process..."

try {
    $startResponse = Invoke-RestMethod -Uri "$BASE_URL/calls/start" `
        -Method Post

    Write-Host "Response: $($startResponse | ConvertTo-Json)" -ForegroundColor Gray
    Write-Host ""

    if ($startResponse.ok -eq $true) {
        Write-Host "✅ Call process boshlandi" -ForegroundColor Green
        $sessionId = $startResponse.sessionId
        Write-Host "Session ID: $sessionId" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Call process start xato" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Call process start xato: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan

# Test 4: Status tekshirish
Write-Host "Test 4: Session status tekshirish" -ForegroundColor Yellow
Write-Host "Checking session status..."

Start-Sleep -Seconds 2

try {
    $statusResponse = Invoke-RestMethod -Uri "$BASE_URL/calls/session/$sessionId" `
        -Method Get

    Write-Host "Response: $($statusResponse | ConvertTo-Json)" -ForegroundColor Gray
    Write-Host ""

    if ($statusResponse.status) {
        Write-Host "✅ Session status olindi" -ForegroundColor Green
        Write-Host "Status: $($statusResponse.status)" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Session status olishda xato" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Session status olishda xato: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan

# Test 5: All sessions list
Write-Host "Test 5: Barcha sessionslar ro'yxati" -ForegroundColor Yellow
Write-Host "Getting all sessions..."

try {
    $sessionsResponse = Invoke-RestMethod -Uri "$BASE_URL/calls/sessions/all?limit=5" `
        -Method Get

    Write-Host "Response: $($sessionsResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Gray
    Write-Host ""

    if ($sessionsResponse) {
        Write-Host "✅ Sessions ro'yxati olindi" -ForegroundColor Green
        Write-Host "Total sessions: $($sessionsResponse.Count)" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Sessions ro'yxatini olishda xato" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Sessions ro'yxatini olishda xato: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Test tugallandi!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan

# Cleanup
Write-Host ""
Write-Host "Cleaning up test files..."
Remove-Item -Path "test_numbers.txt" -ErrorAction SilentlyContinue
Write-Host "✅ Test fayllar o'chirildi" -ForegroundColor Green
