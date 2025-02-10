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
  title: string;

  @IsString()
  @MinLength(5)
  description: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0, { message: 'Price should not be less than zero' })
  price: number;
}
