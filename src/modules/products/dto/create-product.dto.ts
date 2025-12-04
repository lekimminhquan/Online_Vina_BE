import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ProductVariantInputDto {
  @ApiProperty({
    description: 'Giá trị size của biến thể',
    example: 'M',
  })
  @IsString()
  @MinLength(1, { message: 'Giá trị size không được để trống' })
  value: string;

  @ApiProperty({
    description: 'Giá cho biến thể cụ thể',
    example: 80000,
    type: Number,
  })
  @IsNumber()
  @IsPositive({ message: 'Giá của biến thể phải lớn hơn 0' })
  price: number;
}

export class CreateProductDto {
  @ApiProperty({
    description: 'Tên sản phẩm (tối thiểu 10 ký tự)',
    example: 'Sản phẩm test 123456',
    minLength: 10,
  })
  @IsString()
  @MinLength(10, { message: 'Tên sản phẩm phải có ít nhất 10 ký tự' })
  name: string;

  @ApiProperty({
    description: 'Danh sách URL hình ảnh',
    example: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
    ],
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty({ message: 'images không được rỗng' })
  @IsString({ each: true, message: 'Mỗi phần tử trong images phải là string' })
  images: string[];

  @ApiProperty({
    description: 'Đơn vị tính',
    example: 'cái',
  })
  @IsString()
  @MinLength(1, { message: 'Đơn vị tính không được để trống' })
  unit: string;

  @ApiProperty({
    description: 'ID danh mục',
    example: 1,
    type: Number,
  })
  @IsInt({ message: 'categoryId phải là số nguyên' })
  categoryId: number;

  @ApiProperty({
    description:
      'Danh sách biến thể sản phẩm theo size, mỗi phần tử gồm value (size) và price',
    example: [
      { value: 'S', price: 70000 },
      { value: 'M', price: 80000 },
      { value: 'L', price: 90000 },
    ],
    type: [ProductVariantInputDto],
  })
  @IsArray()
  @ArrayNotEmpty({ message: 'variants không được rỗng' })
  @ValidateNested({ each: true })
  @Type(() => ProductVariantInputDto)
  variants: ProductVariantInputDto[];
}
