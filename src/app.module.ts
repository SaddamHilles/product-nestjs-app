import { MailModule } from './mail/mail.module';
import {
  ClassSerializerInterceptor,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { ReviewsModule } from './reviews/reviews.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './products/product.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './users/user.entity';
import { Review } from './reviews/reviews.entity';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { UploadModule } from './uploads/uploads.module';
import { LoggerMiddleware } from './utils/middlewares/logger.middleware';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';

@Module({
  controllers: [AppController],
  imports: [
    ReviewsModule,
    UsersModule,
    ProductsModule,
    UploadModule,
    MailModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        database: config.get<string>('DB_DATABASE'),
        username: config.get<string>('DB_USERNAME'),
        password: String(config.get<string>('DB_PASSWORD')),
        port: config.get<number>('DB_PORT'),
        host: 'localhost',
        synchronize: process.env.NODE_ENV !== 'production', // Only in development
        entities: [Product, User, Review],
      }),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV !== 'prod'
          ? `.env.${process.env.NODE_ENV}`
          : '.env',
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 4000,
        limit: 3,
      },
      {
        name: 'meduim',
        ttl: 10000,
        limit: 7,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 15,
      },
    ]),
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .exclude({ path: 'api/products', method: RequestMethod.POST })
      .forRoutes({ path: 'api/products', method: RequestMethod.ALL });

    // consumer
    //   .apply(AuthMiddleware)
    //   .forRoutes({ path: 'api/auth/users', method: RequestMethod.POST });
  }
}
