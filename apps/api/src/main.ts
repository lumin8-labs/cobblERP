import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = Array.from(
    new Set(
      [
        process.env.NEXT_PUBLIC_APP_URL,
        process.env.BETTER_AUTH_URL,
        'http://localhost:3000',
        'http://localhost:4000',
      ].filter((origin): origin is string => Boolean(origin))
    )
  );

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 NestJS API is running on: http://localhost:${port}`);
}

bootstrap();
