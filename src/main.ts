import { loadedEnvFile } from './config/load-env';

console.log(`Environment: ${process.env.NODE_ENV || 'production'} (${loadedEnvFile})`);

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Add global validation pipe for DTO validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Mail & Notification Service API')
    .setDescription(
      'Handles email, FCM push notifications, and notification template management',
    )
    .setVersion('1.0.0')
    .addTag('Notifications', 'Notification sending APIs')
    .addTag('Admin - Notifications', 'Admin notification management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = Number(process.env.PORT || 6026);
  const msHost = process.env.MS_HOST || '0.0.0.0';
  const msPort = Number(process.env.MS_PORT || 4003);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: { host: msHost, port: msPort },
  });

  await app.startAllMicroservices();
  await app.listen(port, '0.0.0.0');
  console.log(`Mail Service HTTP is running on: http://localhost:${port}`);
  console.log(`Mail Service TCP microservice listening on: ${msHost}:${msPort}`);
  console.log(`Swagger docs available at: http://localhost:${port}/api-docs`);
}

bootstrap();
