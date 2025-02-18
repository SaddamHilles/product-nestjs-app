import {
  IsString,
  IsNumber,
  IsNotEmpty,
  Min,
  IsOptional,
  Length,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 150)
  @IsOptional()
  @ApiPropertyOptional({ example: 'pen' })
  title?: string;

  @IsString()
  @MinLength(5)
  @IsOptional()
  @ApiPropertyOptional({ example: 'this product is amazing one' })
  description?: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @IsOptional()
  @ApiPropertyOptional({ example: 5 })
  price?: number;
}
