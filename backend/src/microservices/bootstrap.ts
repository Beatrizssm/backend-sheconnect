import { ValidationPipe } from '@nestjs/common';
import { Type } from '@nestjs/common/interfaces';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

export async function bootstrapMicroservice(
  appModule: Type<unknown>,
  options: {
    serviceName: string;
    port: number;
    enableSwagger?: boolean;
  },
): Promise<void> {
  const app = await NestFactory.create(appModule);

  app.use(helmet());

  const configuredOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const localDevOriginPattern = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/;

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin || configuredOrigins.includes(origin) || localDevOriginPattern.test(origin)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
    credentials: true,
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  if (options.enableSwagger) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle(`SheConnect ${options.serviceName.toUpperCase()} API`)
      .setDescription(`Microserviço ${options.serviceName} da plataforma SheConnect.`)
      .setVersion('1.0.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
  }

  await app.listen(options.port);
}
