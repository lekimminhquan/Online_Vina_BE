import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNumber,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
    description: 'Giá cũ',
    example: 100000,
    type: Number,
  })
  @IsNumber()
  @IsPositive({ message: 'priceOld phải lớn hơn 0' })
  priceOld: number;

  @ApiProperty({
    description: 'Giá mới',
    example: 80000,
    type: Number,
  })
  @IsNumber()
  @IsPositive({ message: 'priceNew phải lớn hơn 0' })
  priceNew: number;

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
    description: 'Danh sách kích thước',
    example: ['S', 'M', 'L', 'XL'],
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty({ message: 'sizes không được rỗng' })
  @IsString({ each: true, message: 'Mỗi phần tử trong sizes phải là string' })
  sizes: string[];
}
