import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { Repository, Like, Between, FindOptionsWhere } from 'typeorm';
import { Product } from './product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ProductsService {
  // constructor(private readonly usersService: UsersService) {}

  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Create New Product
   * @param dto data for creating nee product
   * @param userId id of the logged in user (ADMIN)
   * @returns the created product from the db
   */
  public async createProduct(dto: CreateProductDto, userId: number) {
    const user = await this.usersService.getCurrentUser(userId);
    const newProduct = this.productsRepository.create({
      ...dto,
      title: dto.title.toLowerCase(),
      user,
    });
    return await this.productsRepository.save(newProduct);
  }

  /**
   * Get all Product
   * @returns collect of products
   */
  public getAll(title?: string, minPrice?: string, maxPrice?: string) {
    const where: FindOptionsWhere<Product> = {};

    if (title) {
      where.title = Like(`%${title}%`);
    }

    const min = minPrice !== undefined ? Number(minPrice) : 1;
    const max =
      maxPrice !== undefined ? Number(maxPrice) : Number.MAX_SAFE_INTEGER;

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = Between(min, max);
    }

    return this.productsRepository.find({ where });
  }

  /**
   * Get one Product by Id
   * @param id id of the product
   * @returns product from db
   */
  public async getOneBy(id: number) {
    const product = await this.productsRepository.findOne({
      where: { id },
      // relations: { user: true, reviews: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with id (${id}) Not found!`, {
        description: 'Not found Error',
      });
    }
    return product;
  }

  /**
   * Update Product
   * @param id of the product
   * @param dto data for updating the existing product
   * @returns the updated product
   */
  public async update(id: number, dto: UpdateProductDto) {
    const product = await this.getOneBy(id);
    product.title = dto.title ?? product.title;
    product.description = dto.description ?? product.description;
    product.price = dto.price ?? product.price;
    return this.productsRepository.save(product);
  }

  /**
   * Delete Product
   * @param id id of the product
   * @returns a success message
   */
  public async delete(id: number) {
    const product = await this.getOneBy(id);

    await this.productsRepository.remove(product);
    return { message: 'product deleted successfully' };
  }
}
