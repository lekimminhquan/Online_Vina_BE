import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(10, { message: 'Tên sản phẩm phải có ít nhất 10 ký tự' })
  name: string;

  @IsNumber()
  @IsPositive({ message: 'priceOld phải lớn hơn 0' })
  priceOld: number;

  @IsNumber()
  @IsPositive({ message: 'priceNew phải lớn hơn 0' })
  priceNew: number;

  @IsArray()
  @ArrayNotEmpty({ message: 'images không được rỗng' })
  @IsString({ each: true, message: 'Mỗi phần tử trong images phải là string' })
  images: string[];

  @IsString()
  @MinLength(1, { message: 'Đơn vị tính không được để trống' })
  unit: string;

  @IsInt({ message: 'categoryId phải là số nguyên' })
  categoryId: number;

  @IsArray()
  @ArrayNotEmpty({ message: 'sizes không được rỗng' })
  @IsString({ each: true, message: 'Mỗi phần tử trong sizes phải là string' })
  sizes: string[];
}
