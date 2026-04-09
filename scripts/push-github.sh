#!/bin/bash
# Aggiorna il remote GitHub con il token corretto e pusha master

set -e

echo "🔧 Aggiornamento remote GitHub..."
sed -i "s|x-access-token:[^@]*|x-access-token:${GITHUB_TOKEN}|g" .git/config

echo "🚀 Push master → github..."
git push "https://x-access-token:${GITHUB_TOKEN}@github.com/liviom53/lingue-AI.git" master

echo "✅ Push completato!"
