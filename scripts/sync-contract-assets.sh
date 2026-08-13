#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE_DIR="${ROOT_DIR}/artifacts/safematch-v2"
TARGET_DIR="${ROOT_DIR}/public/zk/safematch-v2"

if [[ ! -d "${SOURCE_DIR}/keys" || ! -d "${SOURCE_DIR}/zkir" ]]; then
  echo "Compiled SafeMatch V2 assets missing. Run npm run contract:compile first." >&2
  exit 1
fi

mkdir -p "${TARGET_DIR}"
rm -rf "${TARGET_DIR}/keys" "${TARGET_DIR}/zkir"
cp -R "${SOURCE_DIR}/keys" "${TARGET_DIR}/keys"
cp -R "${SOURCE_DIR}/zkir" "${TARGET_DIR}/zkir"
echo "SafeMatch V2 proving assets synced to public/zk/safematch-v2"
