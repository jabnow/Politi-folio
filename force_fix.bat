@echo off
echo --- FORCE FIX GIT LOCKS ---

echo 1. Killing stuck git processes...
taskkill /F /IM git.exe >nul 2>&1

echo 2. Removing lock file...
if exist .git\index.lock del .git\index.lock

echo 3. Checking status...
git status

echo 4. Committing and Pushing...
git add .
git commit -m "Refactor: Finalize backend folder structure (Force Fix)"
git push origin backend

echo --- DONE ---
pause
