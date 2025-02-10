import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  ParseIntPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { ProductsService } from './products.service';
import { AuthRoleGuard } from 'src/users/guards/auth-roles.guard';
import { Roles } from 'src/users/decorators/user-role.decorator';
import { UserType } from 'src/utils/enums';
import { CurrentUser } from 'src/users/decorators/current-user.decorator';
import { JWTPayloadType } from 'src/utils/types';

@Controller('/api/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  public getAllProducts(
    @Query('title') title: string,
    @Query('minPrice') minPrice: string,
    @Query('maxPrice') maxPrice: string,
  ) {
    return this.productsService.getAll(title, minPrice, maxPrice);
  }

  @Get(':id')
  public getProductById(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.getOneBy(id);
  }

  @Post()
  @UseGuards(AuthRoleGuard)
  @Roles(UserType.ADMIN)
  public createNewProduct(
    @Body()
    body: CreateProductDto,
    @CurrentUser() payload: JWTPayloadType,
  ) {
    return this.productsService.createProduct(body, payload.id);
  }

  @Put(':id')
  @UseGuards(AuthRoleGuard)
  @Roles(UserType.ADMIN)
  public updateProductById(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateProductDto,
  ) {
    return this.productsService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(AuthRoleGuard)
  @Roles(UserType.ADMIN)
  public deleteProductById(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.delete(id);
  }
}

// import {
//   Controller,
//   Get,
//   Post,
//   Body,
//   Param,
//   NotFoundException,
//   Put,
//   Delete,
//   Req,
//   Res,
//   Headers,
//   ParseIntPipe,
// } from '@nestjs/common';
// import { Request, Response } from 'express';
// import { CreateProductDto } from './dtos/create-product.dto';
// import { UpdateProductDto } from './dtos/update-product.dto';

// type ProductType = { id: number; title: string; price: number };

// @Controller('/api/products')
// export class ProductsController {
//   private products: ProductType[] = [
//     { id: 1, title: 'book', price: 12.4 },
//     { id: 2, title: 'pen', price: 17.1 },
//     { id: 3, title: 'notepad', price: 8.7 },
//   ];

//   // Don't yes this way in NestJS
//   @Post('express-way')
//   public createNewProductExpressWay(
//     @Req() req: Request,
//     @Res({ passthrough: true }) res: Response,
//   ) {
//     const { title, price } = req.body as CreateProductDto;
//     const newProduct: ProductType = {
//       id: this.products.length + 1,
//       title,
//       price,
//     };

//     this.products.push(newProduct);

//     res.cookie('authCookie', 'this is a cookie', {
//       httpOnly: true,
//       maxAge: 120,
//     });
//     res.status(201).json({ success: true, data: newProduct });
//   }

//   @Post()
//   public createNewProduct(
//     @Body()
//     body: CreateProductDto,
//     @Headers() headers: Record<string, string>,
//     // @Res() res: Response,
//   ) {
//     console.log('headers: ', headers);
//     const newProduct: ProductType = {
//       id: this.products.length + 1,
//       title: body.title,
//       price: body.price,
//     };

//     this.products.push(newProduct);

//     // res.cookie('token', 'your-token-value', {
//     //   httpOnly: true, // Prevents client-side access
//     //   secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
//     //   maxAge: 24 * 60 * 60 * 1000, // 1 day expiration
//     //   sameSite: 'strict', // Prevents CSRF attacks
//     // });
//     // res.status(201).json({ success: true, data: newProduct });

//     return newProduct;
//   }

//   @Get()
//   public getAllProducts() {
//     return this.products;
//   }

//   @Get(':id')
//   public getProductById(@Param('id', ParseIntPipe) id: number) {
//     const product = this.products.find((prod) => prod.id === id);
//     // if (!product) {
//     //   return res
//     //     .status(404)
//     //     .json({ msg: `Product with id (${id}) Not found!` });
//     // }
//     if (!product) {
//       throw new NotFoundException(`Product with id (${id}) Not found!`, {
//         description: 'Not found Error',
//       });
//     }
//     return product;
//   }

//   @Put(':id')
//   public updateProductById(
//     @Param('id', ParseIntPipe) id: number,
//     @Body() body: UpdateProductDto,
//   ) {
//     const productIndex = this.products.findIndex((prod) => prod.id === id);

//     if (productIndex === -1) {
//       throw new NotFoundException(`Product with id (${id}) Not found!`);
//     }

//     this.products[productIndex] = {
//       ...this.products[productIndex],
//       ...(body.title && { title: body.title }),
//       ...(body.price !== undefined && { price: body.price }),
//     };

//     return {
//       msg: 'Product updated successfully',
//       product: this.products[productIndex],
//     };
//   }

//   @Delete(':id')
//   public deleteProductById(@Param('id') id: string) {
//     const productIndex = this.products.findIndex(
//       (prod) => prod.id === parseInt(id),
//     );

//     if (productIndex === -1) {
//       throw new NotFoundException(`Product with id (${id}) Not found!`);
//     }

//     const deletedProd = this.products.find((prod) => String(prod.id) === id);
//     this.products.splice(productIndex, 1);
//     return {
//       msg: 'Product deleted successfully',
//       product: deletedProd,
//     };
//   }
// }
