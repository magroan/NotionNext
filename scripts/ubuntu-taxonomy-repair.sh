#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${PORT:-3800}"
BASE_URL="http://127.0.0.1:${PORT}"
SERVER_PID=""

cleanup() {
  if [ -n "${SERVER_PID}" ] && kill -0 "${SERVER_PID}" >/dev/null 2>&1; then
    kill "${SERVER_PID}" >/dev/null 2>&1 || true
    wait "${SERVER_PID}" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

cd "${ROOT_DIR}"

if ! command -v node >/dev/null 2>&1; then
  echo "node is required" >&2
  exit 1
fi

NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]")"
if [ "${NODE_MAJOR}" -lt 20 ]; then
  echo "node 20 or later is required" >&2
  exit 1
fi

if [ ! -d node_modules ]; then
  if command -v corepack >/dev/null 2>&1; then
    corepack enable >/dev/null 2>&1 || true
  fi

  if command -v yarn >/dev/null 2>&1; then
    yarn install --frozen-lockfile
  else
    npm install
  fi
fi

node scripts/verify-taxonomy-routes.cjs

if command -v yarn >/dev/null 2>&1; then
  yarn lint
  yarn type-check
  yarn build
else
  npm run lint
  npm run type-check
  npm run build
fi

if command -v yarn >/dev/null 2>&1; then
  PORT="${PORT}" yarn start > .taxonomy-smoke-server.log 2>&1 &
else
  PORT="${PORT}" npm run start > .taxonomy-smoke-server.log 2>&1 &
fi
SERVER_PID="$!"

for _ in $(seq 1 60); do
  if curl -fsS "${BASE_URL}" >/dev/null 2>&1; then
    break
  fi
  sleep 2
 done

curl -fsS "${BASE_URL}" >/dev/null
node scripts/taxonomy-smoke.cjs "${BASE_URL}"

echo "taxonomy repair pipeline completed successfully"
