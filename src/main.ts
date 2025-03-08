import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { PayloadTooLargeExceptionFilter } from './uploads/custom-exception-filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  app.useGlobalFilters(new PayloadTooLargeExceptionFilter());

  // Apply Middlewares
  app.use(helmet());

  // Cors policy
  app.enableCors({
    origin: 'http://localhost:3000',
  });

  // Swagger config
  const swagger = new DocumentBuilder()
    .setTitle('Nest JS Products - App API')
    .setDescription('Your API desciption')
    .addServer('http://localhost:5000')
    .setTermsOfService('http://localhost:5000/terms-of-service')
    .setLicense('MIT Lincese', 'htts://www.google.com')
    .setVersion('1.0')
    .addSecurity('bearer', { type: 'http', scheme: 'bearer' })
    .addBearerAuth()
    .build();
  const documentation = SwaggerModule.createDocument(app, swagger);
  SwaggerModule.setup('swagger', app, documentation);

  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
