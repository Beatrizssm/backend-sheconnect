#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND="$ROOT/backend"

if [ -f "$BACKEND/.env" ]; then
  set -a
  # shellcheck disable=SC1091
  source "$BACKEND/.env"
  set +a
fi

export DATABASE_URL="${DATABASE_URL:-postgresql://sheconnect:sheconnect@127.0.0.1:5432/sheconnect?schema=public}"
export MONGODB_URI="${MONGODB_URI:-mongodb://sheconnect:sheconnect@127.0.0.1:27017/sheconnect?authSource=admin}"
export RABBITMQ_URL="${RABBITMQ_URL:-amqp://sheconnect:sheconnect@127.0.0.1:5672}"
export JWT_SECRET="${JWT_SECRET:-change-me-to-a-secure-secret}"
export JWT_REFRESH_SECRET="${JWT_REFRESH_SECRET:-change-me-to-a-secure-refresh-secret}"

cd "$BACKEND"

for service in iam audit data core; do
  node "dist/microservices/main-${service}.js" > "/tmp/sheconnect-${service}.log" 2>&1 &
  echo "started ${service} (pid $!)"
done

sleep 10

for port in 3001 3003 3002 3000; do
  echo -n "health :${port} -> "
  curl -sf "http://127.0.0.1:${port}/api/health" || echo FAIL
  echo
done
