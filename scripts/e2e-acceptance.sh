#!/usr/bin/env bash
set -euo pipefail

GATEWAY="${GATEWAY:-http://127.0.0.1:3333}"
ADMIN_EMAIL="${ADMIN_EMAIL:-yasmin.santos.48@sheconnect.com}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-Senha123}"

echo "== 1. Login admin via gateway =="
LOGIN=$(curl -sf -X POST "$GATEWAY/api/auth/login" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")
TOKEN=$(echo "$LOGIN" | python3 -c "import sys,json; print(json.load(sys.stdin)['accessToken'])")
echo "OK — token obtido"

echo "== 2. GET /api/startups =="
curl -sf "$GATEWAY/api/startups" -H "Authorization: Bearer $TOKEN" | python3 -c "import sys,json; d=json.load(sys.stdin); print('OK —', len(d.get('data', d)), 'startups')"
echo

echo "== 3. GET /api/metrics/users (admin) =="
curl -sf "$GATEWAY/api/metrics/users" -H "Authorization: Bearer $TOKEN" | python3 -c "import sys,json; d=json.load(sys.stdin); print('OK — total users:', d['total'])"
echo

echo "== 4. GET /api/metrics/dashboard =="
curl -sf "$GATEWAY/api/metrics/dashboard" -H "Authorization: Bearer $TOKEN" | python3 -c "import sys,json; d=json.load(sys.stdin); print('OK — users total:', d['users']['total'])"
echo

echo "== 5. GET /api/audit-logs (aguardando consistência eventual) =="
sleep 2
curl -sf "$GATEWAY/api/audit-logs?limit=1" -H "Authorization: Bearer $TOKEN" | python3 -c "import sys,json; d=json.load(sys.stdin); print('OK — audit entries:', len(d.get('data',[])))"
echo

echo "== 6. GET /api/health via gateway =="
curl -sf "$GATEWAY/api/health" | python3 -c "import sys,json; d=json.load(sys.stdin); print('OK — core api:', d.get('api'))"
echo

echo "Todos os testes de aceitação passaram."
