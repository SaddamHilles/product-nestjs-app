import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { PayloadTooLargeExceptionFilter } from './uploads/custom-exception-filter';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  app.useGlobalFilters(new PayloadTooLargeExceptionFilter());
  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
