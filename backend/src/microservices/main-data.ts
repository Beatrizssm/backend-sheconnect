import 'reflect-metadata';

process.env.SERVICE_NAME = 'data';
process.env.PORT = '3002';
process.env.RABBITMQ_QUEUE_NAME = 'sheconnect.data';

async function main(): Promise<void> {
  const { bootstrapMicroservice } = await import('./bootstrap');
  const { AppDataModule } = await import('./app-data.module');
  await bootstrapMicroservice(AppDataModule, {
    serviceName: 'data',
    port: Number(process.env.PORT),
  });
}

void main();
