# Data microservice

Build context: repository root (`services/Dockerfile` with `SERVICE_ENTRY=microservices/main-data`).

Port: **3002**

Routes: `/api/metrics/*`, `/api/dashboard/*`. Consumes RabbitMQ queue `sheconnect.data`.
