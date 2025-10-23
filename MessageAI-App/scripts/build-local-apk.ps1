# Local APK Build Script for MessageAI
# Builds production APK on your local machine

param(
    [switch]$Clean = $false
)

Write-Host "🚀 MessageAI - Local Production Build" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "🔍 Checking prerequisites..." -ForegroundColor Yellow

# Check Java
$javaVersion = java -version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Java not found! Please install Java JDK 17+" -ForegroundColor Red
    Write-Host "   Download: https://adoptium.net/" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Java: Installed" -ForegroundColor Green

# Check Android SDK
if (-not $env:ANDROID_HOME) {
    Write-Host "❌ ANDROID_HOME not set!" -ForegroundColor Red
    Write-Host "   Run: .\scripts\setup-android-sdk.ps1" -ForegroundColor Yellow
    exit 1
}
if (-not (Test-Path "$env:ANDROID_HOME\platform-tools\adb.exe")) {
    Write-Host "❌ Android SDK not found at: $env:ANDROID_HOME" -ForegroundColor Red
    Write-Host "   Run: .\scripts\setup-android-sdk.ps1" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Android SDK: $env:ANDROID_HOME" -ForegroundColor Green

# Check Node modules
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ npm install failed!" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✅ Dependencies: Installed" -ForegroundColor Green
Write-Host ""

# Prebuild (generate android folder)
if ($Clean -or -not (Test-Path "android")) {
    Write-Host "🏗️  Generating native Android project..." -ForegroundColor Yellow
    Write-Host "   This may take 2-3 minutes..." -ForegroundColor Gray
    Write-Host ""
    
    if ($Clean -and (Test-Path "android")) {
        Remove-Item -Path "android" -Recurse -Force
    }
    
    npx expo prebuild --platform android --clean
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Prebuild failed!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Native project generated" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "✅ Native Android project exists (use -Clean to regenerate)" -ForegroundColor Green
    Write-Host ""
}

# Build APK
Write-Host "🔨 Building production APK..." -ForegroundColor Yellow
Write-Host "   This will take 3-5 minutes..." -ForegroundColor Gray
Write-Host ""

Push-Location android

# Clean build if requested
if ($Clean) {
    Write-Host "🧹 Cleaning previous builds..." -ForegroundColor Yellow
    .\gradlew.bat clean
}

# Build release APK
Write-Host "📦 Assembling release APK..." -ForegroundColor Yellow
.\gradlew.bat assembleRelease

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Build failed!" -ForegroundColor Red
    Pop-Location
    exit 1
}

Pop-Location

# Find APK
$apkPath = "android\app\build\outputs\apk\release\app-release.apk"

if (-not (Test-Path $apkPath)) {
    Write-Host "❌ APK not found at expected location!" -ForegroundColor Red
    exit 1
}

$apkSize = [math]::Round((Get-Item $apkPath).Length / 1MB, 2)

Write-Host ""
Write-Host "✅ BUILD SUCCESSFUL!" -ForegroundColor Green
Write-Host ""
Write-Host "📦 APK Location: $apkPath" -ForegroundColor Yellow
Write-Host "📊 APK Size: $apkSize MB" -ForegroundColor Yellow
Write-Host ""

# Get SHA-1 fingerprint
Write-Host "🔐 Getting SHA-1 fingerprint..." -ForegroundColor Yellow

$keystorePath = "$env:USERPROFILE\.android\debug.keystore"
if (Test-Path $keystorePath) {
    Write-Host ""
    Write-Host "SHA-1 Fingerprint (add this to Firebase):" -ForegroundColor Cyan
    Write-Host "===========================================" -ForegroundColor Cyan
    
    $sha1Output = keytool -list -v -keystore $keystorePath -alias androiddebugkey -storepass android -keypass android 2>&1 | Select-String "SHA1:"
    
    if ($sha1Output) {
        Write-Host $sha1Output -ForegroundColor Green
    } else {
        Write-Host "Could not extract SHA-1. Run manually:" -ForegroundColor Yellow
        Write-Host 'keytool -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android' -ForegroundColor Gray
    }
    
    Write-Host ""
    Write-Host "📋 Add this SHA-1 to Firebase:" -ForegroundColor Yellow
    Write-Host "   https://console.firebase.google.com/project/messageai-19a09/settings/general" -ForegroundColor Gray
    Write-Host "   → Android app → Add fingerprint → Paste SHA-1 → Save" -ForegroundColor Gray
} else {
    Write-Host "⚠️  Debug keystore not found yet (will be created on first use)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📱 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Add SHA-1 to Firebase (see link above)" -ForegroundColor White
Write-Host "   2. Transfer APK to Android device" -ForegroundColor White
Write-Host "   3. Install: $apkPath" -ForegroundColor White
Write-Host "   4. Test authentication!" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Build completed in local mode!" -ForegroundColor Green
Write-Host ""

# Open folder
Write-Host "📂 Opening APK folder..." -ForegroundColor Yellow
Start-Process "explorer.exe" -ArgumentList "/select,`"$(Resolve-Path $apkPath)`""

