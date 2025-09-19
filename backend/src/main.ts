import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: [
      'http://localhost:5173',            
      'https://email-management-sigma.vercel.app', 
    ],
    credentials: true,
  });

  const port = process.env.PORT || 3001; 
  await app.listen(port, '0.0.0.0');     

  console.log(`🚀 Email Management System running on http://localhost:${port}`);
}
bootstrap();