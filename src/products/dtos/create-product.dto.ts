import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsNotEmpty,
  Min,
  Length,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @IsString({ message: 'Title should be a string value' })
  @IsNotEmpty({ message: 'Title should not be empty!' })
  @Length(2, 150)
  @ApiProperty({
    description: 'Title of the product',
  })
  title: string;

  @IsString()
  @MinLength(5)
  @ApiProperty({
    description: 'Description of the product',
  })
  description: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Price of the product',
  })
  @Min(0, { message: 'Price should not be less than zero' })
  price: number;
}
