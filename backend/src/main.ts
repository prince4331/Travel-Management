import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './common/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend and mobile app
  app.enableCors({
    origin: true, // Allow all origins for development (mobile app needs this)
    credentials: true,
  });
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const port = parseInt(process.env.PORT || '3000', 10);
  const host = process.env.HOST || '0.0.0.0'; // Listen on all network interfaces
  await app.listen(port, host, () => {
    // Log explicit listen info to aid debugging
    // Using console.log so it appears in terminal output reliably
    // eslint-disable-next-line no-console
    console.log(`Backend listening on http://${host}:${port}`);
  });
}

bootstrap();
