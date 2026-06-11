# SheConnect

Plataforma corporativa para conectar mulheres empreendedoras, mentoras e investidoras.

## Arquitetura

- Backend: Node.js, NestJS, TypeScript, Prisma, JWT, bcrypt.
- Banco principal: PostgreSQL.
- Dados assíncronos: MongoDB para chat, event logs e analytics.
- Mensageria: RabbitMQ com exchange `sheconnect.domain-events`.
- Estilo: DDD, arquitetura hexagonal, SOLID, Clean Architecture e modular monolith.
- Testes: Jest.

## Estrutura

- `backend/`: API NestJS corporativa.
- `backend/prisma/`: schema e migrations Prisma.
- `backend/src/modules/`: bounded contexts da aplicação.
- `backend/src/infrastructure/`: bancos, mensageria, auditoria e integrações.
- `frontend/`: aplicação React + Vite conectada aos endpoints reais.

## Variáveis De Ambiente

Use `backend/.env.example` como base:

```bash
DATABASE_URL="postgresql://sheconnect:sheconnect@127.0.0.1:5432/sheconnect?schema=public"
MONGODB_URI="mongodb://sheconnect:sheconnect@localhost:27017/sheconnect?authSource=admin"
RABBITMQ_URL="amqp://sheconnect:sheconnect@localhost:5672"
JWT_SECRET="change-me"
JWT_REFRESH_SECRET="change-me-refresh"
CORS_ORIGIN="http://localhost:3000,http://localhost:5173"
```

## Como Rodar

```bash
cd backend
npm install
docker-compose up -d
npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run start:dev
```

A API fica em `http://localhost:3333/api`.

### Windows (fluxo testado)

1. Instale o [Docker Desktop](https://www.docker.com/products/docker-desktop/) e deixe-o em execução antes dos comandos abaixo.
2. No `backend/.env`, prefira **`127.0.0.1`** em vez de `localhost` no `DATABASE_URL` (evita falhas de conexão com PostgreSQL no Windows):

   ```bash
   DATABASE_URL="postgresql://sheconnect:sheconnect@127.0.0.1:5432/sheconnect?schema=public"
   ```

3. Suba os serviços e aplique o schema:

   ```powershell
   cd backend
   docker compose up -d
   npm run prisma:generate
   npm run prisma:migrate
   npm run seed
   npm run start:dev
   ```

4. Em outro terminal, suba o frontend:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

5. Acesse `http://localhost:3000` (Vite). Rotas úteis: `/`, `/login`, `/app/dashboard`, `/app/mentorias`, `/app/conexoes`, `/app/chat`.

6. Login de teste após o seed: `admin@sheconnect.com` / `Senha123`.

Swagger: `http://localhost:3333/api/docs`.

Health check: `GET http://localhost:3333/api/health`.

## Seed

O comando `npm run seed` popula PostgreSQL e MongoDB com dados realistas:

- 50 usuárias: empreendedoras, mentoras, investidoras e admins.
- 20 startups.
- 40 mentorias.
- 15 eventos com inscrições.
- 100 mensagens em `chat_messages`.
- logs em `audit_logs` e `event_logs`.

Senha padrão dos usuários gerados: `Senha123`.

Usuária admin principal: `admin@sheconnect.com`.

## Endpoints Principais

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/dashboard/admin`
- `GET /api/audit-logs`
- `POST /api/startups`
- `GET /api/startups`
- `PATCH /api/startups/:id`
- `DELETE /api/startups/:id`
- `POST /api/mentorships/request`
- `PATCH /api/mentorships/:id/accept`
- `PATCH /api/mentorships/:id/reject`
- `PATCH /api/mentorships/:id/complete`
- `GET /api/mentorships/my`
- `POST /api/events`
- `GET /api/events`
- `PATCH /api/events/:id`
- `DELETE /api/events/:id`
- `POST /api/events/:id/register`
- `POST /api/networking/connect`
- `PATCH /api/networking/:id/accept`
- `GET /api/users/me`
- `PATCH /api/users/me`
- `POST /api/users/request-verification`
- `POST /api/users/:id/report`
- `GET /api/admin/users/pending-verifications` (ADMIN)
- `GET /api/admin/users/reports` (ADMIN)
- `PATCH /api/admin/users/:id/approve-verification` (ADMIN)
- `PATCH /api/admin/users/:id/reject-verification` (ADMIN)
- `GET /api/networking/my-connections`
- `GET /api/notifications`
- `PATCH /api/notifications/:id/read`

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Por padrão, o frontend espera a API em `http://localhost:3333/api`.

## Testes E Qualidade

```bash
cd backend
npm run lint
npm test
npm run test:coverage
npm run build
```

O projeto mantém resiliência para RabbitMQ e MongoDB: se alguma dependência assíncrona estiver indisponível, a API continua respondendo e o health check informa o status real.
