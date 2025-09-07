#!/usr/bin/env bash
set -euo pipefail

# Update backend smart contracts and sync generated clients to frontend
# - Builds contracts with AlgoKit
# - Copies generated TypeScript clients to the frontend contracts folder

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
CONTRACTS_DIR="$ROOT_DIR/smart_contracts"
ARTIFACTS_DIR="$CONTRACTS_DIR/artifacts"

# Frontend location
FRONTEND_DIR="$ROOT_DIR/../indabax-frontend/src/contracts"

echo "[1/3] Building contracts via AlgoKit..."
algokit project run build | cat

echo "[2/3] Ensuring frontend contracts directory exists..."
mkdir -p "$FRONTEND_DIR"

copy_client() {
  local artifact_subdir="$1"
  local client_filename="$2"
  local output_name="$3"

  local src="$ARTIFACTS_DIR/$artifact_subdir/$client_filename"
  local dst="$FRONTEND_DIR/$output_name"

  if [[ -f "$src" ]]; then
    cp "$src" "$dst"
    echo "Copied $client_filename -> $dst"
  else
    echo "Skip: $src not found"
  fi
}

echo "[3/3] Syncing generated TypeScript clients to frontend..."
# FX Hedge
copy_client "fx_hedge" "FXHedgeContractClient.ts" "FXHedgeContract.ts"
# HelloWorld (if present)
copy_client "hello_world" "HelloWorldClient.ts" "HelloWorld.ts"

echo "Done. Backend updated and clients synced."


