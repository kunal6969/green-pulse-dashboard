#!/bin/bash

# Green Pulse GitHub Upload Script
# Run this script after creating your GitHub repository

echo "🚀 Green Pulse - GitHub Upload Script"
echo "====================================="

# Check if we're in the right directory
if [ ! -f "README.md" ] || [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: Please run this script from the Green Pulse project root directory"
    exit 1
fi

echo "📁 Current directory: $(pwd)"
echo "📋 Repository status:"
git status --porcelain

# Get GitHub username
read -p "🔑 Enter your GitHub username: " GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    echo "❌ Error: GitHub username is required"
    exit 1
fi

echo "🔗 Setting up remote repository..."
git remote add origin https://github.com/$GITHUB_USERNAME/green-pulse-dashboard.git

echo "📤 Pushing code to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo "✅ Success! Your repository is now live at:"
    echo "🌐 https://github.com/$GITHUB_USERNAME/green-pulse-dashboard"
    echo ""
    echo "🎉 Next steps:"
    echo "1. Visit your repository URL above"
    echo "2. Add repository topics: react, typescript, energy-management, machine-learning, fastapi"
    echo "3. Enable GitHub Pages for demo hosting"
    echo "4. Create your first release (v1.0.0)"
    echo ""
    echo "📖 Check GITHUB_SETUP.md for detailed post-creation instructions"
else
    echo "❌ Error: Failed to push to GitHub"
    echo "💡 Make sure you've created the repository on GitHub.com first"
    echo "💡 Check your GitHub username and repository name"
fi