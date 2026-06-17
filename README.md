# SheConnect

Plataforma corporativa para conectar mulheres empreendedoras, mentoras e investidoras.

## Arquitetura (Fase 1 — Microserviços)

A plataforma roda como **4 microserviços NestJS** independentes, com **API Gateway nginx na porta 3333** e comunicação assíncrona via **RabbitMQ**.

```mermaid
flowchart TB
  FE[Frontend_Vite_3000] --> NGX[nginx_3333]
  NGX --> IAM[iam_3001]
  NGX --> CORE[core_3000]
  NGX --> DATA[data_3002]
  NGX --> AUDIT[audit_3003]
  IAM --> PG[(PostgreSQL)]
  CORE --> PG
  AUDIT --> PG
  DATA --> PG
  DATA --> MONGO[(MongoDB)]
  IAM --> RMQ[RabbitMQ]
  CORE --> RMQ
  RMQ --> AUDIT
  RMQ --> DATA
```

| Serviço | Porta | Responsabilidade |
|---------|-------|------------------|
| **IAM** | 3001 | Auth, users, JWT, admin users |
| **Core** | 3000 | Startups, mentorias, eventos, chat, networking, notificações, WebSocket |
| **Data** | 3002 | Metrics, dashboard admin, consumers MongoDB |
| **Audit** | 3003 | GET `/audit-logs`, consumer de auditoria assíncrona |
| **Gateway** | 3333 | Roteamento `/api/*` para o frontend |

Diagrama PlantUML: [`diagramas/arquitetura/microservicos.puml`](diagramas/arquitetura/microservicos.puml).

### Pacote compartilhado

- [`packages/shared`](packages/shared) — `@sheconnect/shared`: ports (`AuditLoggerPort`, `EventBusPort`), guards JWT/Roles, `RabbitMqPublisher`, `RabbitAuditLogger`, schema Prisma espelhado.

### Monólito legado

O diretório [`backend/`](backend/) permanece como base de código compartilhada entre os serviços. O entrypoint monolítico (`npm run start:dev` na porta 3333) ainda funciona para desenvolvimento local, mas **a arquitetura alvo é microserviços + gateway**.

## Estrutura

```
backend-sheconnect/
├── packages/shared/          # ports, guards, messaging, prisma
├── services/                 # Dockerfiles e README por serviço
├── gateway/nginx.conf        # roteamento produção (Docker network)
├── docker-compose.yml        # infra + 4 serviços + gateway
├── backend/                  # código NestJS (módulos compartilhados)
└── frontend/                 # React + Vite
```

## Variáveis de ambiente

Use `backend/.env.example` como base:

```bash
DATABASE_URL="postgresql://sheconnect:sheconnect@127.0.0.1:5432/sheconnect?schema=public"
MONGODB_URI="mongodb://sheconnect:sheconnect@127.0.0.1:27017/sheconnect?authSource=admin"
RABBITMQ_URL="amqp://sheconnect:sheconnect@127.0.0.1:5672"
JWT_SECRET="change-me"
JWT_REFRESH_SECRET="change-me-refresh"
CORS_ORIGIN="http://localhost:3000,http://localhost:5173"
```

Cada microserviço define `SERVICE_NAME` (`iam`, `core`, `data`, `audit`) e porta própria via entrypoint em `backend/src/microservices/`.

## Como rodar (microserviços + gateway)

### 1. Infraestrutura

```bash
cd backend
docker-compose up -d
```

> A infra usa os containers `sheconnect-postgres`, `sheconnect-mongodb` e `sheconnect-rabbitmq` na rede `sheconnect-network`. O `docker-compose.yml` da raiz **não recria** a infra — evita conflito de nomes se ela já estiver rodando.

### 2. Banco e seed

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run seed
```

### 3. Microserviços (desenvolvimento local)

**Atalho (4 processos + health check):**

```bash
cd backend && npm run build
bash ../scripts/start-microservices.sh
```

Ou em terminais separados, a partir de `backend/`:

```bash
npm run start:iam    # :3001
npm run start:core   # :3000
npm run start:data   # :3002
npm run start:audit  # :3003
```

> **Importante:** não exporte `PORT=3333` ao iniciar os microserviços — cada um usa porta fixa no entrypoint.

### 4. Gateway

**Produção (Docker Compose completo):**

```bash
# Infra + microserviços + gateway (recomendado)
bash scripts/docker-up.sh

# Ou manualmente:
cd backend && docker-compose up -d
cd .. && docker-compose up -d --build
```

API disponível em `http://localhost:3333/api`.

**Desenvolvimento (serviços no host):**

```bash
docker run -d --name sheconnect-gateway \
  --add-host=host.docker.internal:host-gateway \
  -p 3333:3333 \
  -v "$(pwd)/gateway/nginx.dev.conf:/etc/nginx/nginx.conf:ro" \
  nginx:1.27-alpine
```

### 5. Frontend

```bash
cd frontend
npm install
npm run dev
```

O frontend usa `VITE_API_URL=http://localhost:3333/api` por padrão.

## Documentação técnica — seção 5.1 (Microserviços)

### Comunicação assíncrona

- Exchange RabbitMQ: `sheconnect.domain-events`
- IAM e Core **publicam** eventos de domínio e logs de auditoria (`AUDIT_LOG`)
- Audit consome fila `sheconnect.audit` e persiste em `AuditLog`
- Data consome fila `sheconnect.data` e grava `event_logs` no MongoDB

A auditoria nos microserviços IAM/Core é **assíncrona** (`RabbitAuditLogger`); consistência eventual na listagem de audit logs (~1s).

### Autenticação

- IAM emite JWT (`JWT_SECRET` compartilhado)
- Core, Data e Audit validam token via `JwtAuthModule` (mesmo secret)
- Sem chamadas HTTP síncronas entre serviços na v1

### PostgreSQL compartilhado (Fase 1)

Um único schema Prisma evita quebrar FKs durante a extração. Database-per-service fica fora do escopo v1.

### Health checks

| Endpoint | Serviço |
|----------|---------|
| `GET /api/health` via gateway | Core (proxy default) |
| `GET :3001/api/health` | IAM |
| `GET :3000/api/health` | Core |
| `GET :3002/api/health` | Data |
| `GET :3003/api/health` | Audit |

## Seed

```bash
cd backend && npm run seed
```

- 50 usuárias, 20 startups, 40 mentorias, 15 eventos
- Senha padrão: `Senha123`
- Admins de teste: `yasmin.santos.48@sheconnect.com`, `paula.xavier.49@sheconnect.com`

## Endpoints principais (via gateway :3333)

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/users/me`
- `GET /api/startups`
- `POST /api/startups`
- `GET /api/audit-logs` (ADMIN)
- `GET /api/metrics/dashboard` (ADMIN/MENTOR)
- `GET /api/dashboard/admin` (ADMIN)
- Swagger: `http://localhost:3333/api/docs` (Core)

## Testes e qualidade

```bash
cd backend
npm run lint
npm test
npm run build
```

**Testes de aceitação (gateway :3333):** com infra, microserviços e gateway rodando:

```bash
bash scripts/e2e-acceptance.sh
# ou: cd backend && npm run test:e2e:gateway
```

## Monólito (legado)

```bash
cd backend
docker-compose up -d   # infra em backend/docker-compose.yml
npm run start:dev      # monólito na porta 3333 (substituído pelo gateway em produção)
```

Swagger monólito: `http://localhost:3333/api/docs`.
