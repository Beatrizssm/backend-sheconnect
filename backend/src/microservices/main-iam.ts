import 'reflect-metadata';

process.env.SERVICE_NAME = 'iam';
process.env.PORT = '3001';

async function main(): Promise<void> {
  const { bootstrapMicroservice } = await import('./bootstrap');
  const { AppIamModule } = await import('./app-iam.module');
  await bootstrapMicroservice(AppIamModule, {
    serviceName: 'iam',
    port: Number(process.env.PORT),
  });
}

void main();
