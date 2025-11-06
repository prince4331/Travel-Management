import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './common/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend running on port 3001
  app.enableCors({
    origin: ['http://localhost:3001', 'http://127.0.0.1:3001'],
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
  const host = process.env.HOST || 'localhost';
  await app.listen(port, host, () => {
    // Log explicit listen info to aid debugging
    // Using console.log so it appears in terminal output reliably
    // eslint-disable-next-line no-console
    console.log(`Backend listening on http://${host}:${port}`);
  });
}

bootstrap();
