#!/bin/bash

# ─────────────────────────────────────────
#  singularity-shop — STOP
# ─────────────────────────────────────────

APP_NAME="singularity-shop"
TMUX_SESSION="singularity-shop"
BACKEND_PORT=8091
FRONTEND_PORT=4201

is_running() {
    lsof -i :$1 -sTCP:LISTEN -t >/dev/null 2>&1
}

echo "[$APP_NAME] Oprire aplicație..."

# Omoară sesiunea tmux
tmux kill-session -t "$TMUX_SESSION" 2>/dev/null

# Forțează eliberarea porturilor dacă mai sunt ocupate
for PORT in $BACKEND_PORT $FRONTEND_PORT; do
    if is_running $PORT; then
        echo "[$APP_NAME] Forțăm oprirea procesului pe portul $PORT..."
        kill -9 $(lsof -i :$PORT -sTCP:LISTEN -t) 2>/dev/null
    fi
done

# Așteaptă să se elibereze porturile
TIMEOUT=15
COUNT=0
while is_running $BACKEND_PORT || is_running $FRONTEND_PORT; do
    sleep 1
    COUNT=$((COUNT + 1))
    if [ "$COUNT" -ge "$TIMEOUT" ]; then
        echo "[$APP_NAME] AVERTISMENT: Timeout la oprire."
        break
    fi
done

echo "[$APP_NAME] Aplicația a fost oprită."
