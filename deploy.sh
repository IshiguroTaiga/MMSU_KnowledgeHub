#!/bin/bash
# MMSU Knowledge Hub deployment helper script

echo "============================================="
echo "  MMSU KNOWLEDGE HUB DEPLOYMENT AUTOMATION   "
echo "============================================="

# 1. Pull changes
echo "[1/3] Pulling latest code changes from GitHub..."
git pull origin main

# 2. Rebuild container
echo "[2/3] Rebuilding and launching Docker containers..."
docker compose down
docker compose up -d --build

# 3. Done
echo "[3/3] Deployment complete! ✅"
echo "============================================="
