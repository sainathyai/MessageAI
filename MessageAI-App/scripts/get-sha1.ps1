# Get SHA-1 Fingerprint Script for MessageAI
# Extracts SHA-1 from local keystore for Firebase registration

Write-Host "🔐 MessageAI - SHA-1 Fingerprint Extractor" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$keystorePath = "$env:USERPROFILE\.android\debug.keystore"

if (-not (Test-Path $keystorePath)) {
    Write-Host "❌ Debug keystore not found at: $keystorePath" -ForegroundColor Red
    Write-Host ""
    Write-Host "The keystore is created automatically when you:" -ForegroundColor Yellow
    Write-Host "  1. Build an APK locally (run: .\scripts\build-local-apk.ps1)" -ForegroundColor White
    Write-Host "  2. Run: npx expo run:android" -ForegroundColor White
    Write-Host ""
    Write-Host "After building once, run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Keystore found: $keystorePath" -ForegroundColor Green
Write-Host ""

Write-Host "🔍 Extracting SHA-1 fingerprint..." -ForegroundColor Yellow
Write-Host ""

# Get full keystore info
$keystoreInfo = keytool -list -v -keystore $keystorePath -alias androiddebugkey -storepass android -keypass android 2>&1

# Extract SHA-1
$sha1 = $keystoreInfo | Select-String "SHA1:" | ForEach-Object { $_.ToString().Trim() }

# Extract SHA-256
$sha256 = $keystoreInfo | Select-String "SHA256:" | ForEach-Object { $_.ToString().Trim() }

if ($sha1) {
    Write-Host "✅ Fingerprints extracted successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host " COPY THIS SHA-1 TO FIREBASE" -ForegroundColor Cyan
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host $sha1 -ForegroundColor Green
    Write-Host ""
    Write-Host "SHA-256 (optional):" -ForegroundColor Gray
    Write-Host $sha256 -ForegroundColor Gray
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Copy to clipboard
    try {
        $sha1Value = $sha1 -replace ".*SHA1:\s*", ""
        Set-Clipboard -Value $sha1Value
        Write-Host "✅ SHA-1 copied to clipboard!" -ForegroundColor Green
        Write-Host ""
    } catch {
        Write-Host "⚠️  Could not copy to clipboard (manual copy needed)" -ForegroundColor Yellow
        Write-Host ""
    }
    
    Write-Host "📋 Add to Firebase Console:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  1. Go to: https://console.firebase.google.com/project/messageai-19a09/settings/general" -ForegroundColor White
    Write-Host "  2. Scroll to 'Your apps' section" -ForegroundColor White
    Write-Host "  3. Find Android app: com.messageai.app" -ForegroundColor White
    Write-Host "  4. Click 'Add fingerprint'" -ForegroundColor White
    Write-Host "  5. Paste the SHA-1 (already in clipboard!)" -ForegroundColor White
    Write-Host "  6. Click 'Save'" -ForegroundColor White
    Write-Host "  7. Wait 10 minutes for propagation" -ForegroundColor White
    Write-Host ""
    Write-Host "✅ After adding, your local APK will authenticate!" -ForegroundColor Green
    
} else {
    Write-Host "❌ Could not extract SHA-1 fingerprint" -ForegroundColor Red
    Write-Host ""
    Write-Host "Try running manually:" -ForegroundColor Yellow
    Write-Host 'keytool -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android' -ForegroundColor Gray
}

Write-Host ""

