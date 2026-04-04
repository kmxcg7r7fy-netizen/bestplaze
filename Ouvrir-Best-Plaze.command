#!/bin/bash
# Double-clic (macOS) : installe si besoin, démarre Next.js, ouvre le navigateur.
ROOT="$(cd "$(dirname "$0")" && pwd)"
APP="$ROOT/best-plaze"

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

cd "$APP" || {
  echo "Erreur : dossier introuvable : $APP"
  read -r -p "Appuyez sur Entrée pour fermer…"
  exit 1
}

if ! command -v npm >/dev/null 2>&1; then
  echo "npm introuvable. Installe Node.js : https://nodejs.org"
  echo "Ou avec Homebrew : brew install node"
  read -r -p "Appuyez sur Entrée pour fermer…"
  exit 1
fi

if [ ! -d "node_modules" ]; then
  echo "Première installation des dépendances (peut prendre 1–2 min)…"
  npm install || {
    echo "npm install a échoué."
    read -r -p "Appuyez sur Entrée pour fermer…"
    exit 1
  }
fi

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
  echo "Un serveur écoute déjà sur le port 3000."
  open "http://127.0.0.1:3000"
  exit 0
fi

echo "Démarrage de Best Plaze sur http://127.0.0.1:3000 …"
npm run dev &
DEV_PID=$!

for _ in $(seq 1 30); do
  CODE="$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000 2>/dev/null || echo "000")"
  if [ "$CODE" = "200" ] || [ "$CODE" = "304" ]; then
    echo "OK — ouverture du navigateur."
    open "http://127.0.0.1:3000"
    echo ""
    echo "Garde cette fenêtre ouverte. Pour arrêter le serveur : Ctrl+C"
    wait "$DEV_PID"
    exit 0
  fi
  sleep 1
done

echo "Le serveur ne répond pas encore. Vérifie les messages d’erreur ci-dessus."
open "http://127.0.0.1:3000" 2>/dev/null || true
echo "Attente du processus (Ctrl+C pour tout arrêter)…"
wait "$DEV_PID"
