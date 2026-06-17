FROM node:22-alpine AS builder

WORKDIR /app

COPY backend/package*.json ./backend/
COPY packages/shared/package*.json ./packages/shared/

WORKDIR /app/backend
RUN npm ci

WORKDIR /app
COPY backend ./backend
COPY packages/shared ./packages/shared

WORKDIR /app/backend
RUN npm run prisma:generate
RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app/backend

ENV NODE_ENV=production

COPY --from=builder /app/backend/package*.json ./
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/prisma ./prisma

ARG SERVICE_ENTRY=microservices/main-core
ENV SERVICE_ENTRY=${SERVICE_ENTRY}

EXPOSE 3000

CMD node dist/${SERVICE_ENTRY}.js
