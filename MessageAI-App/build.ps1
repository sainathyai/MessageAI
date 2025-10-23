# Quick Build Script for MessageAI
# Builds APK and opens the folder

Write-Host "🚀 Building MessageAI APK..." -ForegroundColor Cyan
Write-Host ""

# Check if android folder exists
if (-not (Test-Path "android")) {
    Write-Host "📁 Android project not found. Generating..." -ForegroundColor Yellow
    npx expo prebuild --platform android --clean
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to generate Android project" -ForegroundColor Red
        exit 1
    }
}

# Build
Write-Host "🔨 Building release APK..." -ForegroundColor Yellow
Push-Location android
.\gradlew.bat assembleRelease

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Build failed!" -ForegroundColor Red
    Pop-Location
    exit 1
}

Pop-Location

$apkPath = "android\app\build\outputs\apk\release\app-release.apk"

if (Test-Path $apkPath) {
    $apkSize = [math]::Round((Get-Item $apkPath).Length / 1MB, 2)
    Write-Host ""
    Write-Host "✅ BUILD SUCCESSFUL!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📦 APK: $apkPath" -ForegroundColor Yellow
    Write-Host "📊 Size: $apkSize MB" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📂 Opening APK folder..." -ForegroundColor Yellow
    Start-Process "explorer.exe" -ArgumentList "/select,`"$(Resolve-Path $apkPath)`""
} else {
    Write-Host "❌ APK not found!" -ForegroundColor Red
    exit 1
}

