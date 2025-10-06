import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS
  app.enableCors({
    origin: ['https://analytic.navai.pro', 'http://localhost:5173'],
    credentials: true,
  });

  // Handle application/x-www-form-urlencoded
  app.use(express.urlencoded({ extended: true }));

  app.useStaticAssets(
    join(dirname(fileURLToPath(import.meta.url)), '..', 'uploads'),
    {
      prefix: '/uploads/',
    },
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Navai Analytics API')
    .setDescription('NestJS + Prisma backend for SIP audio analytics')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
