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
  echo "Un serveur écoute déjà sur le port 3000 — ouverture du navigateur."
  open "http://127.0.0.1:3000"
  exit 0
fi

echo "Démarrage de Best Plaze sur http://127.0.0.1:3000 …"
echo "(Le premier démarrage peut prendre 20–40 s.)"

# Ouvre le navigateur même si le health-check échoue (build Turbopack lent)
( sleep 6 && open "http://127.0.0.1:3000" ) &
OPEN_PID=$!

npm run dev &
DEV_PID=$!

# Attend que la page réponde (suivre les redirections -L)
for _ in {1..45}; do
  CODE="$(curl -sL -o /dev/null -w "%{http_code}" "http://127.0.0.1:3000/" 2>/dev/null || echo "000")"
  case "$CODE" in
    200|204|301|302|307|308)
      echo "OK (HTTP $CODE) — ouverture du navigateur."
      kill "$OPEN_PID" 2>/dev/null || true
      open "http://127.0.0.1:3000"
      echo ""
      echo "Garde cette fenêtre ouverte. Pour arrêter : Ctrl+C"
      wait "$DEV_PID"
      exit 0
      ;;
  esac
  if ! kill -0 "$DEV_PID" 2>/dev/null; then
    echo "Erreur : le serveur s'est arrêté. Relance ce script ou lance « npm run dev » dans best-plaze pour voir l'erreur."
    kill "$OPEN_PID" 2>/dev/null || true
    read -r -p "Appuyez sur Entrée pour fermer…"
    exit 1
  fi
  sleep 1
done

echo "Délai dépassé — ouverture du navigateur quand même (recharge la page si besoin)."
kill "$OPEN_PID" 2>/dev/null || true
open "http://127.0.0.1:3000" 2>/dev/null || true
echo "Attente du serveur (Ctrl+C pour arrêter)…"
wait "$DEV_PID"
