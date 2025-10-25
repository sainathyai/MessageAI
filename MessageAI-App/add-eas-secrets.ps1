# EAS Secrets Setup Script
# This script will help you add all required environment variables to EAS

Write-Host "🔐 EAS Secrets Setup for MessageAI" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "First, let's get your Firebase configuration..." -ForegroundColor Yellow
Write-Host "Open: https://console.firebase.google.com/project/messageai-19a09/settings/general" -ForegroundColor White
Write-Host ""
Write-Host "In the 'Your apps' section, find your Android app and copy the config values." -ForegroundColor White
Write-Host ""
Write-Host "Press Enter when ready to continue..." -ForegroundColor Yellow
Read-Host

# Function to add secret
function Add-Secret {
    param(
        [string]$Name,
        [string]$DefaultValue = "",
        [string]$Description
    )
    
    Write-Host ""
    Write-Host "➤ $Description" -ForegroundColor Cyan
    
    if ($DefaultValue) {
        Write-Host "  Default: $DefaultValue" -ForegroundColor Gray
        $value = Read-Host "  Value (press Enter to use default)"
        if ([string]::IsNullOrWhiteSpace($value)) {
            $value = $DefaultValue
        }
    } else {
        $value = Read-Host "  Value"
    }
    
    if ([string]::IsNullOrWhiteSpace($value)) {
        Write-Host "  ⚠️  Skipped (empty value)" -ForegroundColor Yellow
        return $false
    }
    
    Write-Host "  Adding secret..." -ForegroundColor Gray
    $output = eas secret:create --scope project --name $Name --type string --value $value 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Added: $Name" -ForegroundColor Green
        return $true
    } else {
        Write-Host "  ❌ Failed to add $Name" -ForegroundColor Red
        Write-Host "  $output" -ForegroundColor Red
        return $false
    }
}

Write-Host "Adding EAS Secrets..." -ForegroundColor Yellow
Write-Host ""

# Firebase Configuration
$added = 0
$total = 7

if (Add-Secret -Name "EXPO_PUBLIC_FIREBASE_API_KEY" -Description "Firebase API Key") { $added++ }
if (Add-Secret -Name "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN" -DefaultValue "messageai-19a09.firebaseapp.com" -Description "Firebase Auth Domain") { $added++ }
if (Add-Secret -Name "EXPO_PUBLIC_FIREBASE_PROJECT_ID" -DefaultValue "messageai-19a09" -Description "Firebase Project ID") { $added++ }
if (Add-Secret -Name "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET" -DefaultValue "messageai-19a09.appspot.com" -Description "Firebase Storage Bucket") { $added++ }
if (Add-Secret -Name "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID" -Description "Firebase Messaging Sender ID") { $added++ }
if (Add-Secret -Name "EXPO_PUBLIC_FIREBASE_APP_ID" -Description "Firebase App ID (starts with 1:)") { $added++ }
if (Add-Secret -Name "EXPO_PUBLIC_OPENAI_API_KEY" -Description "OpenAI API Key (starts with sk-)") { $added++ }

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "✅ Added $added out of $total secrets" -ForegroundColor Green
Write-Host ""

# Verify secrets
Write-Host "Verifying secrets..." -ForegroundColor Yellow
eas secret:list

Write-Host ""
Write-Host "✅ Setup complete! You can now build your APK." -ForegroundColor Green
Write-Host ""
Write-Host "Next step: Run 'eas build --platform android --profile preview'" -ForegroundColor Cyan

