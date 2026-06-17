# Audit microservice

Build context: repository root (`services/Dockerfile` with `SERVICE_ENTRY=microservices/main-audit`).

Port: **3003**

Routes: `/api/audit-logs/*`. Consumes RabbitMQ queue `sheconnect.audit`.
