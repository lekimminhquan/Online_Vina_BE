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

export class UpdateSingleVariantDto {
  @ApiProperty({
    description: 'ID của variant (nếu có). Nếu không gửi, server sẽ tạo mới.',
    required: false,
    example: 1,
    type: Number,
  })
  @IsOptional()
  @IsInt()
  id?: number;

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

export class UpdateProductVariantsDto {
  @ApiProperty({
    description: 'ID sản phẩm cần cập nhật variants',
    example: 1,
    type: Number,
  })
  @IsInt({ message: 'productId phải là số nguyên' })
  productId: number;

  @ApiProperty({
    description:
      'Danh sách biến thể sản phẩm theo size. Nếu phần tử có id thì sẽ được update, nếu không có id thì sẽ tạo mới. Những variant cũ không nằm trong danh sách này sẽ bị xoá.',
    example: [
      { id: 1, value: 'S', price: 70000 },
      { id: 2, value: 'M', price: 80000 },
      { value: 'XL', price: 110000 },
    ],
    type: [UpdateSingleVariantDto],
  })
  @IsArray()
  @ArrayNotEmpty({ message: 'variants không được rỗng' })
  @ValidateNested({ each: true })
  @Type(() => UpdateSingleVariantDto)
  variants: UpdateSingleVariantDto[];
}
