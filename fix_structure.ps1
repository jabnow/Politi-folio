# Fix Nested Folder Structure
$ErrorActionPreference = "SilentlyContinue"

# Function to flatten nested folders
function Flatten-Dir($Parent) {
    $Nested = "$Parent\$Parent" # e.g., backend\api\api
    $NestedName = Split-Path -Leaf $Parent # e.g., api
    $NestedPath = Join-Path $Parent $NestedName # backend\api\api

    if (Test-Path $NestedPath) {
        Write-Host "Found nested folder: $NestedPath - Cleaning up..."
        
        # Move contents up one level (overwrite if exists)
        Get-ChildItem "$NestedPath\*" -Recurse | Move-Item -Destination $Parent -Force
        
        # Remove the now empty nested folder
        Remove-Item -Recurse -Force $NestedPath
    }
}

cd backend

# Fix api/api
if (Test-Path "api/api") {
    Write-Host "Flattening api/api..."
    Move-Item -Path "api/api/*" -Destination "api/" -Force
    Remove-Item -Recurse -Force "api/api"
}

# Fix database/database
if (Test-Path "database/database") {
    Write-Host "Flattening database/database..."
    Move-Item -Path "database/database/*" -Destination "database/" -Force
    Remove-Item -Recurse -Force "database/database"
}

cd ..

# Git Sync
git add .
git commit -m "Fix: Flatten nested api/api and database/database folders"
git push origin backend
Write-Host "Structure Fixed!"
