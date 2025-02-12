import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/users/decorators/current-user.decorator';
import { Roles } from 'src/users/decorators/user-role.decorator';
import { AuthRoleGuard } from 'src/users/guards/auth-roles.guard';
import { UserType } from 'src/utils/enums';
import { JWTPayloadType } from 'src/utils/types';
import { CreateReviewDto } from './dtos/create-review.dto';
import { UpdateReviewDto } from './dtos/update-review.dto';
import { ReviewsService } from './reviews.service';

@Controller('/api/reviews')
export class ReviewsContoller {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post(':productId')
  @UseGuards(AuthRoleGuard)
  @Roles(UserType.ADMIN, UserType.NORMAL_USER)
  public createNewReview(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() body: CreateReviewDto,
    @CurrentUser() payload: JWTPayloadType,
  ) {
    return this.reviewsService.createReview(productId, payload.id, body);
  }

  @Get()
  @UseGuards(AuthRoleGuard)
  @Roles(UserType.ADMIN, UserType.NORMAL_USER)
  public getAll(
    @Query('pageNumber', new DefaultValuePipe(1), ParseIntPipe)
    pageNumber: number = 1,
    @Query('reviewsPerPage', new DefaultValuePipe(10), ParseIntPipe)
    reviewsPerPage: number = 10,
  ) {
    return this.reviewsService.getAll(pageNumber, reviewsPerPage);
  }

  @Get(':id')
  @UseGuards(AuthRoleGuard)
  @Roles(UserType.ADMIN, UserType.NORMAL_USER)
  public getOne(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.getReviewById(id);
  }

  @Put(':id')
  @UseGuards(AuthRoleGuard)
  @Roles(UserType.ADMIN, UserType.NORMAL_USER)
  public async updateReviewById(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateReviewDto,
    @CurrentUser() payload: JWTPayloadType,
  ) {
    return this.reviewsService.update(id, payload.id, body);
  }

  @Delete(':id')
  @UseGuards(AuthRoleGuard)
  @Roles(UserType.ADMIN)
  public deleteReview(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() payload: JWTPayloadType,
  ) {
    return this.reviewsService.delete(id, payload);
  }
}
