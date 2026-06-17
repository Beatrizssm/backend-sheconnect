import 'reflect-metadata';

process.env.SERVICE_NAME = 'core';
process.env.PORT = '3000';

async function main(): Promise<void> {
  const { bootstrapMicroservice } = await import('./bootstrap');
  const { AppCoreModule } = await import('./app-core.module');
  await bootstrapMicroservice(AppCoreModule, {
    serviceName: 'core',
    port: Number(process.env.PORT),
    enableSwagger: true,
  });
}

void main();
