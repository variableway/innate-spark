#!/usr/bin/env bash
# Keep tools/registry/apps.yaml in sync with innate-works and hub-hosted repos.
#
# Install from the hub repo root:
#   ln -sf ../../tools/pre-commit.sh .git/hooks/pre-commit
set -euo pipefail

SOURCE="${BASH_SOURCE[0]}"
while [ -L "$SOURCE" ]; do
    DIR="$(cd -P "$(dirname "$SOURCE")" >/dev/null 2>&1 && pwd)"
    SOURCE="$(readlink "$SOURCE")"
    [[ "$SOURCE" != /* ]] && SOURCE="$DIR/$SOURCE"
done
SCRIPT_DIR="$(cd -P "$(dirname "$SOURCE")" >/dev/null 2>&1 && pwd)"
HUB_ROOT="$(dirname "$SCRIPT_DIR")"
CLI="$HUB_ROOT/tools/fire-skills/packages/skill-cli/src/index.ts"
BIN="$HUB_ROOT/tools/fire-skills/dist/skill-spark"
REGISTRY="tools/registry/apps.yaml"

cd "$HUB_ROOT"

echo "[pre-commit] scanning hub base/ + innate-apps/ + skills/ + innate-spark/{base,projects} -> $REGISTRY"
if [ -x "$BIN" ]; then
    "$BIN" registry scan
elif command -v bun >/dev/null 2>&1; then
    bun "$CLI" registry scan
else
    echo "[pre-commit] bun not found and $BIN missing; skip scan" >&2
    exit 1
fi

if git diff --quiet -- "$REGISTRY"; then
    echo "[pre-commit] $REGISTRY is up to date"
else
    git add -- "$REGISTRY"
    echo "[pre-commit] $REGISTRY updated and staged"
fi
