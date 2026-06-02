# SheConnect

Plataforma para conectar mulheres empreendedoras, mentoras e investidoras.

## Estrutura

- `frontend/`: aplicação React + Vite
- `frontend/src/pages/`: páginas/telas do projeto
- `backend/`: API NestJS + Prisma

## Backend

API REST em NestJS + TypeScript com DDD, Arquitetura Hexagonal, Prisma, PostgreSQL, JWT e bcrypt.

### Como rodar

```bash
cd backend
npm install
docker-compose up -d
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run start:dev
```

A API fica em `http://localhost:3333/api`.

### Endpoints principais

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/startups`
- `POST /api/startups`
- `GET /api/startups/:id`
- `PUT /api/startups/:id`
- `DELETE /api/startups/:id`
- `POST /api/mentorships`
- `GET /api/mentorships`

### Usuários seed

Todos usam a senha `Senha123`.

- `admin@sheconnect.com`
- `mentora@sheconnect.com`
- `empreendedora@sheconnect.com`

## Frontend

```bash
cd frontend
npm install
npm run dev
```
