# Android SDK Setup Script for MessageAI
# This script downloads and sets up Android SDK for local builds

Write-Host "🚀 MessageAI - Android SDK Setup" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

$ANDROID_SDK_ROOT = "$env:LOCALAPPDATA\Android\Sdk"
$CMDLINE_TOOLS_URL = "https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip"
$CMDLINE_TOOLS_ZIP = "$env:TEMP\commandlinetools.zip"

# Check if already installed
if (Test-Path "$ANDROID_SDK_ROOT\platform-tools\adb.exe") {
    Write-Host "✅ Android SDK already installed at: $ANDROID_SDK_ROOT" -ForegroundColor Green
    Write-Host ""
    Write-Host "📍 SDK Location: $ANDROID_SDK_ROOT" -ForegroundColor Yellow
    Write-Host "📍 Platform Tools: $ANDROID_SDK_ROOT\platform-tools" -ForegroundColor Yellow
    Write-Host ""
    
    # Set environment variables for current session
    $env:ANDROID_HOME = $ANDROID_SDK_ROOT
    $env:ANDROID_SDK_ROOT = $ANDROID_SDK_ROOT
    $env:PATH = "$ANDROID_SDK_ROOT\platform-tools;$ANDROID_SDK_ROOT\cmdline-tools\latest\bin;$env:PATH"
    
    Write-Host "✅ Environment variables set for this session" -ForegroundColor Green
    Write-Host ""
    
    # Test
    Write-Host "🧪 Testing Android SDK..." -ForegroundColor Yellow
    & "$ANDROID_SDK_ROOT\platform-tools\adb.exe" version
    Write-Host ""
    Write-Host "✅ Setup complete! You can now build locally." -ForegroundColor Green
    exit 0
}

Write-Host "📥 Android SDK not found. Installing..." -ForegroundColor Yellow
Write-Host ""

# Create SDK directory
Write-Host "📁 Creating SDK directory: $ANDROID_SDK_ROOT" -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path $ANDROID_SDK_ROOT | Out-Null

# Download command line tools
Write-Host "📥 Downloading Android Command Line Tools..." -ForegroundColor Yellow
Write-Host "   URL: $CMDLINE_TOOLS_URL" -ForegroundColor Gray
Invoke-WebRequest -Uri $CMDLINE_TOOLS_URL -OutFile $CMDLINE_TOOLS_ZIP -UseBasicParsing

# Extract
Write-Host "📦 Extracting tools..." -ForegroundColor Yellow
Expand-Archive -Path $CMDLINE_TOOLS_ZIP -DestinationPath "$ANDROID_SDK_ROOT\cmdline-tools-temp" -Force

# Move to correct location
Write-Host "📁 Organizing files..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "$ANDROID_SDK_ROOT\cmdline-tools\latest" | Out-Null
Move-Item -Path "$ANDROID_SDK_ROOT\cmdline-tools-temp\cmdline-tools\*" -Destination "$ANDROID_SDK_ROOT\cmdline-tools\latest" -Force
Remove-Item -Path "$ANDROID_SDK_ROOT\cmdline-tools-temp" -Recurse -Force
Remove-Item -Path $CMDLINE_TOOLS_ZIP -Force

# Set environment variables
Write-Host "🔧 Setting environment variables..." -ForegroundColor Yellow
[System.Environment]::SetEnvironmentVariable("ANDROID_HOME", $ANDROID_SDK_ROOT, "User")
[System.Environment]::SetEnvironmentVariable("ANDROID_SDK_ROOT", $ANDROID_SDK_ROOT, "User")

# Get current user PATH
$currentPath = [System.Environment]::GetEnvironmentVariable("PATH", "User")

# Add Android SDK to PATH if not already there
$pathsToAdd = @(
    "$ANDROID_SDK_ROOT\platform-tools",
    "$ANDROID_SDK_ROOT\cmdline-tools\latest\bin"
)

foreach ($pathToAdd in $pathsToAdd) {
    if ($currentPath -notlike "*$pathToAdd*") {
        $currentPath = "$pathToAdd;$currentPath"
    }
}

[System.Environment]::SetEnvironmentVariable("PATH", $currentPath, "User")

# Set for current session
$env:ANDROID_HOME = $ANDROID_SDK_ROOT
$env:ANDROID_SDK_ROOT = $ANDROID_SDK_ROOT
$env:PATH = "$ANDROID_SDK_ROOT\platform-tools;$ANDROID_SDK_ROOT\cmdline-tools\latest\bin;$env:PATH"

Write-Host "✅ Environment variables set!" -ForegroundColor Green
Write-Host ""

# Accept licenses
Write-Host "📜 Accepting Android SDK licenses..." -ForegroundColor Yellow
Write-Host ""
$sdkmanagerPath = Join-Path $ANDROID_SDK_ROOT "cmdline-tools\latest\bin\sdkmanager.bat"
"y`ny`ny`ny`ny`ny`ny`ny`n" | & $sdkmanagerPath --licenses 2>&1 | Out-Null

# Install required SDK components
Write-Host "📦 Installing SDK components (this may take 5-10 minutes)..." -ForegroundColor Yellow
Write-Host ""

$components = @(
    "platform-tools",
    "platforms;android-34",
    "build-tools;34.0.0",
    "cmdline-tools;latest"
)

foreach ($component in $components) {
    Write-Host "   Installing: $component" -ForegroundColor Gray
    & $sdkmanagerPath $component 2>&1 | Out-Null
}

Write-Host ""
Write-Host "✅ Android SDK Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 SDK Location: $ANDROID_SDK_ROOT" -ForegroundColor Yellow
Write-Host "📍 Platform Tools: $ANDROID_SDK_ROOT\platform-tools" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔄 IMPORTANT: Close and reopen your terminal for PATH changes to take effect!" -ForegroundColor Yellow
Write-Host ""
Write-Host "✅ You can now build APKs locally!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Close this terminal" -ForegroundColor White
Write-Host "  2. Open a new terminal" -ForegroundColor White
Write-Host "  3. Run: .\scripts\build-local-apk.ps1" -ForegroundColor White
Write-Host ""

