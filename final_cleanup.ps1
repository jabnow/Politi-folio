# Final Cleanup & Push
$ErrorActionPreference = "SilentlyContinue"

# 1. Ensure backend directory exists
New-Item -ItemType Directory -Force -Path "backend" | Out-Null

# 2. Force Move Function
function Force-Move($Name) {
    if (Test-Path $Name) {
        Write-Host "Moving $Name to backend/$Name..."
        Copy-Item -Recurse -Force $Name "backend/$Name"
        Remove-Item -Recurse -Force $Name
    }
}

# 3. Move items
$ItemsToMove = @("api", "database", "ai", "compliance", "config", "data", "scripts", "tasks", "xrp_integration", "demo.py", "Dockerfile", "docker-compose.yml", "Procfile", "PROGRESS.md", "README.md", "requirements.txt", "start_demo.bat", ".env")

foreach ($Item in $ItemsToMove) {
    # Check if item exists in root (and isn't already inside backend)
    if (Test-Path $Item) {
        Force-Move $Item
    }
}

# 4. Remove Frontend
if (Test-Path "frontend") {
    Write-Host "Removing frontend..."
    Remove-Item -Recurse -Force "frontend"
}

# 5. Remove Temp Scripts
Remove-Item "organize.ps1"
Remove-Item "move_files.bat"

# 6. Git Operations
Write-Host "Pushing to GitHub..."
git add .
git commit -m "Refactor: Enforce backend/ folder structure"
git push origin backend
Write-Host "Success!"
