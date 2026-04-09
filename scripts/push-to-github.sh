#!/usr/bin/env bash
# ─────────────────────────────────────────────
# Sincronizza il monorepo Replit → GitHub
# Repo: https://github.com/liviom53/lingue-AI
# Uso: bash scripts/push-to-github.sh
#      bash scripts/push-to-github.sh "messaggio commit personalizzato"
# ─────────────────────────────────────────────

set -e

GITHUB_USER="liviom53"
GITHUB_REPO="lingue-AI"
BRANCH="main"

# Messaggio commit: argomento o automatico con data
if [ -n "$1" ]; then
  MSG="$1"
else
  MSG="sync: aggiornamento automatico $(date '+%Y-%m-%d %H:%M')"
fi

# Verifica che GITHUB_TOKEN sia disponibile
if [ -z "$GITHUB_TOKEN" ]; then
  echo "❌ GITHUB_TOKEN non trovato — assicurati che sia impostato nei Secrets di Replit."
  exit 1
fi

# Configura identità git (se non già impostata)
git config user.email "livio.mazzocchi@gmail.com" 2>/dev/null || true
git config user.name "Livio Mazzocchi" 2>/dev/null || true

# Aggiunge o aggiorna il remote GitHub
REMOTE_URL="https://${GITHUB_TOKEN}@github.com/${GITHUB_USER}/${GITHUB_REPO}.git"
if git remote get-url github &>/dev/null; then
  git remote set-url github "$REMOTE_URL"
else
  git remote add github "$REMOTE_URL"
fi

echo "📦 Stato modifiche:"
git status --short

# Aggiunge tutto, crea commit solo se ci sono modifiche
if ! git diff --quiet || ! git diff --cached --quiet || [ -n "$(git status --short)" ]; then
  git add -A
  git commit -m "$MSG" || echo "ℹ️  Nessun nuovo commit da creare."
fi

echo ""
echo "🚀 Push verso GitHub (${GITHUB_USER}/${GITHUB_REPO} → ${BRANCH})..."
git push github "HEAD:${BRANCH}" --force-with-lease 2>/dev/null || \
git push github "HEAD:${BRANCH}" --force

echo ""
echo "✅ Sincronizzazione completata!"
echo "   👉 https://github.com/${GITHUB_USER}/${GITHUB_REPO}"
