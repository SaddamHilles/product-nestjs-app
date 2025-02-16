import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { PayloadTooLargeExceptionFilter } from './uploads/custom-exception-filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  app.useGlobalFilters(new PayloadTooLargeExceptionFilter());

  app.enableCors({
    origin: 'http://localhost:3000',
  });

  const swagger = new DocumentBuilder().setVersion('1.0').build();
  const documentation = SwaggerModule.createDocument(app, swagger);
  SwaggerModule.setup('swagger', app, documentation);

  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
