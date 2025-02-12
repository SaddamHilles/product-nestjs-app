import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from './reviews.entity';
import { FindManyOptions, Repository } from 'typeorm';
import { ProductsService } from 'src/products/products.service';
import { UsersService } from 'src/users/users.service';
import { CreateReviewDto } from './dtos/create-review.dto';
import { UpdateReviewDto } from './dtos/update-review.dto';
import { JWTPayloadType } from 'src/utils/types';
import { UserType } from 'src/utils/enums';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewsRepository: Repository<Review>,
    private readonly productsService: ProductsService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Create new review
   * @param productId id of the product
   * @param userId id of the user that created this review
   * @param dto data for creating new review
   * @returns the created review from the db
   */
  public async createReview(
    productId: number,
    userId: number,
    dto: CreateReviewDto,
  ) {
    const product = await this.productsService.getOneBy(productId);
    const user = await this.usersService.getCurrentUser(userId);

    const review = this.reviewsRepository.create({ ...dto, user, product });

    const result = await this.reviewsRepository.save(review);
    return {
      id: result.id,
      comment: result.comment,
      rating: result.rating,
      createdAt: result.createdAt,
      userId: user.id,
      productId: product.id,
    };
  }

  public getAll(pageNumber: number = 1, reviewsPerPage: number = 10) {
    const options: FindManyOptions = {
      order: { createdAt: 'DESC' },
    };

    if (reviewsPerPage > 0) {
      options.skip = reviewsPerPage * (pageNumber - 1);
      options.take = reviewsPerPage;
    }

    return this.reviewsRepository.find(options);
  }

  public async getReviewById(id: number) {
    const review = await this.reviewsRepository.findOne({ where: { id } });
    console.log('review: ', review);
    if (!review) {
      throw new NotFoundException(`Review with id (${id}) not found`);
    }
    return review;
  }

  public async update(id: number, userId: number, dto: UpdateReviewDto) {
    const review = await this.getReviewById(id);
    if (review.user.id !== userId) {
      throw new ForbiddenException('Access denide, you are not allowed');
    }

    review.comment = dto.comment ?? review.comment;
    review.rating = dto.rating ?? review.rating;
    return this.reviewsRepository.save(review);
  }

  public async delete(id: number, payload: JWTPayloadType) {
    const review = await this.getReviewById(id);
    if (!review) {
      throw new NotFoundException(`Review with id (${id}) not found`);
    }
    if (review.user.id === payload.id || payload.userType === UserType.ADMIN) {
      await this.reviewsRepository.remove(review);
      return { message: 'Review has been deleted successfully' };
    }
  }
}
