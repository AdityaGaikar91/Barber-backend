import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // Enable validation globally using ValidationPipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip out fields not defined in DTO
      forbidNonWhitelisted: true, // throw error if extra fields are present
      transform: true, // auto transform payloads to DTO instances
    }),
  );

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  
  // Enable CORS
  app.enableCors({
    origin: [frontendUrl, frontendUrl.replace(/\/$/, '')],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Setup Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('BarberPro API')
    .setDescription('The core backend API documentation for BarberPro.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
