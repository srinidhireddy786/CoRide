param(
    [switch]$BackendOnly,
    [switch]$FrontendOnly
)

if ($BackendOnly -and $FrontendOnly) {
    Write-Host "ERROR: Cannot use both -BackendOnly and -FrontendOnly." -ForegroundColor Red
    exit 1
}

$Root = $PSScriptRoot
$BackendDir = Join-Path $Root "backend"
$FrontendDir = Join-Path $Root "frontend"

function Check-Cmd($Name) {
    if ($null -eq (Get-Command $Name -ErrorAction SilentlyContinue)) {
        Write-Host "ERROR: '$Name' not found. Install it first." -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n=== CoRide Setup & Run ===" -ForegroundColor Cyan

# === Prerequisites ===
Write-Host "`n[1/4] Checking prerequisites..." -ForegroundColor Yellow
$pyVer = python --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Python not found. Install Python 3.12+ first." -ForegroundColor Red
    exit 1
}
Write-Host "  Python: $($pyVer.Trim())" -ForegroundColor Gray
Check-Cmd node
Write-Host "  Node:   $(node --version)" -ForegroundColor Gray
Check-Cmd npm
Write-Host "  npm:    $(npm --version)" -ForegroundColor Gray

$StartBackend = !$FrontendOnly
$StartFrontend = !$BackendOnly

# === Backend Setup ===
if ($StartBackend) {
    Write-Host "`n[2/4] Setting up backend..." -ForegroundColor Yellow
    try {
        Push-Location $BackendDir
        if (!(Test-Path "venv")) {
            Write-Host "  Creating virtual environment..." -ForegroundColor Gray
            python -m venv venv
            if ($LASTEXITCODE -ne 0) { throw "venv creation failed" }
        }
        $pip = Join-Path (Get-Location) "venv\Scripts\pip.exe"
        Write-Host "  Installing Python packages..." -ForegroundColor Gray
        & $pip install -r requirements.txt
        if ($LASTEXITCODE -ne 0) { throw "pip install failed" }
    } catch {
        Write-Host "ERROR: $_" -ForegroundColor Red
        exit 1
    } finally {
        Pop-Location
    }
}

# === Frontend Setup ===
if ($StartFrontend) {
    Write-Host "`n[3/4] Setting up frontend..." -ForegroundColor Yellow
    try {
        Push-Location $FrontendDir
        if (!(Test-Path "node_modules")) {
            Write-Host "  Installing npm packages..." -ForegroundColor Gray
            npm install
            if ($LASTEXITCODE -ne 0) { throw "npm install failed" }
        }
    } catch {
        Write-Host "ERROR: $_" -ForegroundColor Red
        exit 1
    } finally {
        Pop-Location
    }
}

# === Start Servers ===
Write-Host "`n[4/4] Starting servers..." -ForegroundColor Yellow

if ($StartBackend) {
    $pythonExe = Join-Path $BackendDir "venv\Scripts\python.exe"
    $backCmd = "Set-Location '$BackendDir'; & '$pythonExe' -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"

    if ($BackendOnly) {
        Write-Host "  Backend starting (Ctrl+C to stop)..." -ForegroundColor Green
        Set-Location $BackendDir
        & $pythonExe -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
    } else {
        Start-Process -FilePath "powershell" -ArgumentList @("-NoExit", "-ExecutionPolicy", "Bypass", "-Command", $backCmd) -WindowStyle Normal
        Write-Host "  Backend  → http://localhost:8000  (new window)" -ForegroundColor Green
    }
}

if ($StartFrontend) {
    $frontCmd = "Set-Location '$FrontendDir'; npm run dev"

    if ($FrontendOnly) {
        Write-Host "  Frontend starting (Ctrl+C to stop)..." -ForegroundColor Green
        Set-Location $FrontendDir
        npm run dev
    } else {
        Start-Process -FilePath "powershell" -ArgumentList @("-NoExit", "-ExecutionPolicy", "Bypass", "-Command", $frontCmd) -WindowStyle Normal
        Write-Host "  Frontend → http://localhost:5173  (new window)" -ForegroundColor Green
    }
}

if (!$BackendOnly -and !$FrontendOnly) {
    Write-Host "`nBoth servers started — close their windows to stop." -ForegroundColor Cyan
}
