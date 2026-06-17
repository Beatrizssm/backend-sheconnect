import 'reflect-metadata';

process.env.SERVICE_NAME = 'audit';
process.env.PORT = '3003';
process.env.RABBITMQ_QUEUE_NAME = 'sheconnect.audit';

async function main(): Promise<void> {
  const { bootstrapMicroservice } = await import('./bootstrap');
  const { AppAuditModule } = await import('./app-audit.module');
  await bootstrapMicroservice(AppAuditModule, {
    serviceName: 'audit',
    port: Number(process.env.PORT),
  });
}

void main();
