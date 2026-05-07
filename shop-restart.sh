#!/bin/bash

# ─────────────────────────────────────────
#  singularity-shop — RESTART
# ─────────────────────────────────────────

APP_NAME="singularity-shop"

echo "[$APP_NAME] Restart aplicație..."

bash /home/julian-s-server/shop-stop.sh
sleep 2
bash /home/julian-s-server/shop-start.sh

echo "[$APP_NAME] Restart finalizat."
