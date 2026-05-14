#!/bin/bash
# Double-clic (macOS) : installe si besoin, démarre Next.js, ouvre le navigateur.
ROOT="$(cd "$(dirname "$0")" && pwd)"
APP="$ROOT/best-plaze"

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

# Au double-clic, Terminal ne charge pas toujours .zshrc → Node installé via nvm/fnm est « invisible ».
if [[ -s "$HOME/.nvm/nvm.sh" ]]; then
  # shellcheck source=/dev/null
  . "$HOME/.nvm/nvm.sh"
fi
if [[ -s "/opt/homebrew/opt/nvm/nvm.sh" ]]; then
  # shellcheck source=/dev/null
  . "/opt/homebrew/opt/nvm/nvm.sh"
fi
if command -v fnm >/dev/null 2>&1; then
  eval "$(fnm env)"
elif [[ -x "$HOME/.local/share/fnm/fnm" ]]; then
  eval "$("$HOME/.local/share/fnm/fnm" env)"
fi

cd "$APP" || {
  echo "Erreur : dossier introuvable : $APP"
  read -r -p "Appuyez sur Entrée pour fermer…"
  exit 1
}

if ! command -v npm >/dev/null 2>&1; then
  echo "npm introuvable dans ce Terminal."
  echo "Installe Node.js (https://nodejs.org) ou ouvre un terminal où « which npm » fonctionne,"
  echo "puis lance : cd \"$APP\" && npm run dev"
  read -r -p "Appuyez sur Entrée pour fermer…"
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "node introuvable (npm est là mais pas node — installez Node.js correctement)."
  read -r -p "Appuyez sur Entrée pour fermer…"
  exit 1
fi

echo "Node : $(command -v node) ($(node -v 2>/dev/null || echo ?))"
echo "npm  : $(command -v npm) ($(npm -v 2>/dev/null || echo ?))"
echo ""

if [ ! -d "node_modules" ]; then
  echo "Première installation des dépendances (peut prendre 1–2 min)…"
  npm install || {
    echo "npm install a échoué."
    read -r -p "Appuyez sur Entrée pour fermer…"
    exit 1
  }
fi

URL="http://127.0.0.1:3000"

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
  echo "Un serveur écoute déjà sur le port 3000 — ouverture du navigateur."
  open "$URL"
  exit 0
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Best Plaze — serveur local"
echo "  Utilisez cette adresse (IPv4, plus fiable que « localhost ») :"
echo "  $URL"
echo ""
echo "  Ne fermez pas cette fenêtre tant que vous testez le site."
echo "  Pour arrêter : Ctrl+C"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

npm run dev &
DEV_PID=$!

READY=0
for _ in $(seq 1 90); do
  CODE="$(curl -sS -o /dev/null -w "%{http_code}" "$URL/" 2>/dev/null || echo "000")"
  case "$CODE" in
    200|204|301|302|307|308)
      READY=1
      break
      ;;
  esac
  if ! kill -0 "$DEV_PID" 2>/dev/null; then
    echo ""
    echo "Le serveur s'est arrêté avant d'être prêt. Lisez les messages d'erreur ci-dessus."
    wait "$DEV_PID" 2>/dev/null || true
    read -r -p "Appuyez sur Entrée pour fermer…"
    exit 1
  fi
  sleep 1
done

if [[ "$READY" -eq 1 ]]; then
  echo "Serveur prêt (HTTP $CODE) — ouverture du navigateur."
  open "$URL"
else
  echo "Délai dépassé sans réponse HTTP — ouverture quand même (rafraîchissez la page si besoin)."
  open "$URL" 2>/dev/null || true
fi

echo ""
wait "$DEV_PID"
