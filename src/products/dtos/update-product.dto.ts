import {
  IsString,
  IsNumber,
  IsNotEmpty,
  Min,
  IsOptional,
  Length,
  MinLength,
} from 'class-validator';

export class UpdateProductDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 150)
  @IsOptional()
  title?: string;

  @IsString()
  @MinLength(5)
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @IsOptional()
  price?: number;
}
