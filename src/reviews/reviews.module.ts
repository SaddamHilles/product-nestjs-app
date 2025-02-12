import { Module } from '@nestjs/common';
import { ReviewsContoller } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './reviews.entity';
import { UsersModule } from 'src/users/users.module';
import { ProductsModule } from 'src/products/products.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [ReviewsContoller],
  providers: [ReviewsService],
  imports: [
    TypeOrmModule.forFeature([Review]),
    UsersModule,
    ProductsModule,
    JwtModule,
  ],
})
export class ReviewsModule {}
