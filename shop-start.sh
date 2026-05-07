#!/bin/bash

# ─────────────────────────────────────────
#  singularity-shop — START
# ─────────────────────────────────────────

APP_NAME="singularity-shop"
APP_DIR="/home/julian-s-server/singularity-shop"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"
JAR_PATH="$BACKEND_DIR/target/shop-1.0.0.jar"
FRONTEND_DIST="$FRONTEND_DIR/dist/frontend/browser"
LOG_DIR="/home/julian-s-server/logs"
BACKEND_LOG="$LOG_DIR/shop-backend.log"
FRONTEND_LOG="$LOG_DIR/shop-frontend.log"
ENV_FILE="$BACKEND_DIR/.env"
BACKEND_PORT=8091
FRONTEND_PORT=4201
TMUX_SESSION="singularity-shop"

mkdir -p "$LOG_DIR"

is_running() {
    lsof -i :$1 -sTCP:LISTEN -t >/dev/null 2>&1
}

# Verifică că JAR-ul există
if [ ! -f "$JAR_PATH" ]; then
    echo "[$APP_NAME] EROARE: JAR-ul nu există la $JAR_PATH"
    echo "[$APP_NAME] Rulează mai întâi shop-build.sh"
    exit 1
fi

# Verifică că dist-ul Angular există
if [ ! -d "$FRONTEND_DIST" ]; then
    echo "[$APP_NAME] EROARE: Frontend dist nu există la $FRONTEND_DIST"
    echo "[$APP_NAME] Rulează mai întâi shop-build.sh"
    exit 1
fi

# Verifică că .env există
if [ ! -f "$ENV_FILE" ]; then
    echo "[$APP_NAME] EROARE: Fișierul .env nu există la $ENV_FILE"
    exit 1
fi

# Verifică dacă deja rulează
if is_running $BACKEND_PORT || is_running $FRONTEND_PORT; then
    echo "[$APP_NAME] Aplicația rulează deja."
    exit 1
fi

# Oprește session tmux vechi dacă există
tmux kill-session -t "$TMUX_SESSION" 2>/dev/null

# Încarcă variabilele din .env
set -a
source "$ENV_FILE"
set +a

echo "[$APP_NAME] Pornire aplicație..."

# Creează session tmux nou cu două panouri
tmux new-session -d -s "$TMUX_SESSION"

# Panoual 1 — Backend
tmux send-keys -t "$TMUX_SESSION" \
    "cd $BACKEND_DIR && /usr/lib/jvm/java-21-openjdk-amd64/bin/java -jar $JAR_PATH --spring.profiles.active=prod 2>&1 | tee -a $BACKEND_LOG" C-m

sleep 3

# Panoul 2 — Frontend
tmux split-window -h -t "$TMUX_SESSION"
tmux send-keys -t "$TMUX_SESSION" \
    "cd $FRONTEND_DIR && npx http-server dist/frontend/browser -p $FRONTEND_PORT --spa -c-1 2>&1 | tee -a $FRONTEND_LOG" C-m

echo "[$APP_NAME] Backend pornit pe portul $BACKEND_PORT"
echo "[$APP_NAME] Frontend pornit pe portul $FRONTEND_PORT"

sleep 2

# Deschide terminal cu tmux attach
if command -v gnome-terminal &> /dev/null; then
    gnome-terminal -- tmux attach -t "$TMUX_SESSION" &
elif command -v xfce4-terminal &> /dev/null; then
    xfce4-terminal -e "tmux attach -t $TMUX_SESSION" &
elif command -v konsole &> /dev/null; then
    konsole -e "tmux attach -t $TMUX_SESSION" &
else
    tmux attach -t "$TMUX_SESSION"
fi
