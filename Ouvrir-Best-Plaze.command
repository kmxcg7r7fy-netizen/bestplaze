#!/bin/bash
# Double-clic sur ce fichier (macOS) : démarre l’app et ouvre le navigateur.
cd "$(dirname "$0")" || exit 1
export PATH="/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:$PATH"

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
  echo "Un serveur écoute déjà sur le port 3000 — ouverture du navigateur."
  open "http://127.0.0.1:3000"
  exit 0
fi

echo "Démarrage de Best Plaze (Next.js)…"
npm run dev --prefix best-plaze &
DEV_PID=$!

for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15; do
  if curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000 | grep -q 200; then
    echo "OK — ouverture du navigateur."
    open "http://127.0.0.1:3000"
    echo ""
    echo "Laisse cette fenêtre ouverte pour garder le serveur actif."
    echo "Pour arrêter : Ctrl+C"
    wait "$DEV_PID"
    exit 0
  fi
  sleep 1
done

echo "Le serveur met du temps à démarrer. Essaie dans le navigateur : http://127.0.0.1:3000"
open "http://127.0.0.1:3000" 2>/dev/null || true
wait "$DEV_PID"
