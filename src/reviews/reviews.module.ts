import { Module } from '@nestjs/common';
import { ReviewsContoller } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './reviews.entity';

@Module({
  controllers: [ReviewsContoller],
  providers: [ReviewsService],
  imports: [TypeOrmModule.forFeature([Review])],
})
export class ReviewsModule {}
