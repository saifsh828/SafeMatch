#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE_FILE="${ROOT_DIR}/contract/safematch_v2.compact"
OUTPUT_DIR="${ROOT_DIR}/artifacts/safematch-v2"
COMPACT_VERSION="${COMPACT_VERSION:-0.31.0}"

if [[ ! -f "${SOURCE_FILE}" ]]; then
  echo "Contract source not found: ${SOURCE_FILE}" >&2
  exit 1
fi

mkdir -p "${OUTPUT_DIR}"

# Set COMPACTC_BIN when compiler lives outside PATH, e.g.
# COMPACTC_BIN="$HOME/.compact/bin/compactc" npm run contract:compile
if [[ -n "${COMPACTC_BIN:-}" ]]; then
  read -r -a compiler <<< "${COMPACTC_BIN}"
  "${compiler[@]}" "${SOURCE_FILE}" "${OUTPUT_DIR}"
elif command -v compactc >/dev/null 2>&1; then
  compactc "${SOURCE_FILE}" "${OUTPUT_DIR}"
elif command -v compact >/dev/null 2>&1; then
  compact compile "+${COMPACT_VERSION}" "${SOURCE_FILE}" "${OUTPUT_DIR}"
elif command -v compact-cli >/dev/null 2>&1; then
  compact-cli compile "+${COMPACT_VERSION}" "${SOURCE_FILE}" "${OUTPUT_DIR}"
else
  cat >&2 <<'EOF'
Compact compiler not found.
Install the Midnight Compact compiler, then ensure `compactc` (or `compact`) is on PATH.
Or provide a custom binary:
  COMPACTC_BIN=/path/to/compactc npm run contract:compile
EOF
  exit 127
fi

echo "SafeMatch V2 contract compiled to ${OUTPUT_DIR}"
