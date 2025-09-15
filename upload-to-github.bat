@echo off
REM Green Pulse GitHub Upload Script for Windows
REM Run this script after creating your GitHub repository

echo 🚀 Green Pulse - GitHub Upload Script
echo =====================================

REM Check if we're in the right directory
if not exist "README.md" (
    echo ❌ Error: Please run this script from the Green Pulse project root directory
    pause
    exit /b 1
)

if not exist "docker-compose.yml" (
    echo ❌ Error: Please run this script from the Green Pulse project root directory  
    pause
    exit /b 1
)

echo 📁 Current directory: %CD%
echo 📋 Repository status:
git status --porcelain

REM Get GitHub username
set /p GITHUB_USERNAME="🔑 Enter your GitHub username: "

if "%GITHUB_USERNAME%"=="" (
    echo ❌ Error: GitHub username is required
    pause
    exit /b 1
)

echo 🔗 Setting up remote repository...
git remote add origin https://github.com/%GITHUB_USERNAME%/green-pulse-dashboard.git

echo 📤 Pushing code to GitHub...
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo ✅ Success! Your repository is now live at:
    echo 🌐 https://github.com/%GITHUB_USERNAME%/green-pulse-dashboard
    echo.
    echo 🎉 Next steps:
    echo 1. Visit your repository URL above
    echo 2. Add repository topics: react, typescript, energy-management, machine-learning, fastapi
    echo 3. Enable GitHub Pages for demo hosting
    echo 4. Create your first release (v1.0.0^)
    echo.
    echo 📖 Check GITHUB_SETUP.md for detailed post-creation instructions
) else (
    echo ❌ Error: Failed to push to GitHub
    echo 💡 Make sure you've created the repository on GitHub.com first
    echo 💡 Check your GitHub username and repository name
)

pause