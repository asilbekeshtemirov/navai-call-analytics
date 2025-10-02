import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as express from 'express';
import { JwtAuthGuard } from './auth/jwt-auth.guard.js';
async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.use(express.urlencoded({ extended: true }));
    app.useStaticAssets(join(dirname(fileURLToPath(import.meta.url)), '..', 'uploads'), {
        prefix: '/uploads/',
    });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.useGlobalGuards(new JwtAuthGuard(new Reflector()));
    const config = new DocumentBuilder()
        .setTitle('Navai Analytics API')
        .setDescription('NestJS + Prisma backend for SIP audio analytics')
        .setVersion('1.0.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('/docs', app, document);
    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
//# sourceMappingURL=main.js.map