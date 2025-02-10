import { Controller, Get } from '@nestjs/common';
import { ReviewsService } from './reviews.service';

@Controller()
export class ReviewsContoller {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('/api/reviews')
  public getAllReviews() {
    return this.reviewsService.getAll();
  }
}
