#!/bin/sh
set -e

echo "[build-all] Building lingua-ai (production)..."
NODE_ENV=production BASE_PATH=/lingua-ai/ pnpm --filter @workspace/lingua-ai run build

echo "[build-all] Building diario-pescatore (production)..."
NODE_ENV=production BASE_PATH=/ pnpm --filter @workspace/diario-pescatore run build

echo "[build-all] Building api-server..."
pnpm --filter @workspace/api-server run build

echo "[build-all] Done."
