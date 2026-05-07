#!/bin/bash

# ─────────────────────────────────────────
#  singularity-shop — BUILD & RESTART
# ─────────────────────────────────────────

APP_NAME="singularity-shop"
APP_DIR="/home/julian-s-server/singularity-shop"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"

echo "[$APP_NAME] ══════════════════════════════════"
echo "[$APP_NAME]  BUILD & RESTART"
echo "[$APP_NAME] ══════════════════════════════════"

# 1. Git pull
echo ""
echo "[$APP_NAME] [1/5] Git pull..."
cd "$APP_DIR" || { echo "EROARE: directorul $APP_DIR nu există"; exit 1; }

git pull origin master
if [ $? -ne 0 ]; then
    echo "[$APP_NAME] EROARE: git pull a eșuat."
    exit 1
fi
echo "[$APP_NAME] Git pull reușit."

# 2. Maven build backend
echo ""
echo "[$APP_NAME] [2/5] Maven build backend..."
cd "$BACKEND_DIR" || { echo "EROARE: directorul $BACKEND_DIR nu există"; exit 1; }

JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64 mvn clean package -DskipTests
if [ $? -ne 0 ]; then
    echo "[$APP_NAME] EROARE: Build-ul Maven a eșuat."
    exit 1
fi
echo "[$APP_NAME] Backend build reușit."

# 3. Angular build frontend
echo ""
echo "[$APP_NAME] [3/5] Angular build frontend..."
cd "$FRONTEND_DIR" || { echo "EROARE: directorul $FRONTEND_DIR nu există"; exit 1; }

npm install
if [ $? -ne 0 ]; then
    echo "[$APP_NAME] EROARE: npm install a eșuat."
    exit 1
fi

npx ng build --configuration=production
if [ $? -ne 0 ]; then
    echo "[$APP_NAME] EROARE: Angular build a eșuat."
    exit 1
fi
echo "[$APP_NAME] Frontend build reușit."

# 4. Stop
echo ""
echo "[$APP_NAME] [4/5] Oprire aplicație..."
bash /home/julian-s-server/shop-stop.sh

# 5. Start
echo ""
echo "[$APP_NAME] [5/5] Pornire aplicație..."
bash /home/julian-s-server/shop-start.sh

if [ $? -eq 0 ]; then
    echo ""
    echo "[$APP_NAME] ══════════════════════════════════"
    echo "[$APP_NAME]  Deploy finalizat cu succes! ✓"
    echo "[$APP_NAME] ══════════════════════════════════"
else
    echo ""
    echo "[$APP_NAME] EROARE: Aplicația nu a pornit după build."
    exit 1
fi
