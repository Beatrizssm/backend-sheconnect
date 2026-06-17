#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "== Parando microserviços locais (portas 3000-3003) =="
pkill -f 'dist/microservices/main-' 2>/dev/null || true
sleep 1

echo "== Infra (PostgreSQL, MongoDB, RabbitMQ) =="
cd "$ROOT/backend"
docker-compose up -d postgres mongodb rabbitmq

echo "== Aguardando healthchecks da infra =="
for i in $(seq 1 30); do
  pg_ok=$(docker inspect -f '{{.State.Health.Status}}' sheconnect-postgres 2>/dev/null || echo missing)
  mongo_ok=$(docker inspect -f '{{.State.Health.Status}}' sheconnect-mongodb 2>/dev/null || echo missing)
  rabbit_ok=$(docker inspect -f '{{.State.Health.Status}}' sheconnect-rabbitmq 2>/dev/null || echo missing)
  if [ "$pg_ok" = "healthy" ] && [ "$mongo_ok" = "healthy" ] && [ "$rabbit_ok" = "healthy" ]; then
    echo "Infra healthy."
    break
  fi
  sleep 2
done

echo "== Microserviços + gateway =="
cd "$ROOT"
docker-compose up -d --build iam core data audit gateway

echo
echo "Pronto. API: http://localhost:3333/api"
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' | grep sheconnect || true
