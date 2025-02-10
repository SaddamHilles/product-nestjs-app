import { Injectable } from '@nestjs/common';

@Injectable()
export class ReviewsService {
  constructor() {}
  public getAll() {
    return [
      { id: 1, rating: 4, comment: 'good' },
      { id: 2, rating: 3, comment: 'nice' },
      { id: 3, rating: 4.6, comment: 'excellent' },
    ];
  }
}
