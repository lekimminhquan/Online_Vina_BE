import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class OrderProductDto {
  @ApiProperty({
    description: 'ID của sản phẩm',
    example: 1,
    type: Number,
  })
  @IsInt({ message: 'Product id phải là số nguyên' })
  @IsPositive({ message: 'Product id phải lớn hơn 0' })
  id: number;

  @ApiProperty({
    description: 'Số lượng sản phẩm',
    example: 2,
    type: Number,
  })
  @IsInt({ message: 'Quantity phải là số nguyên' })
  @IsPositive({ message: 'Quantity phải lớn hơn 0' })
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'ID của người dùng (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String,
  })
  @IsString()
  @IsNotEmpty({ message: 'UserId không được để trống' })
  @IsUUID('4', { message: 'UserId phải là UUID hợp lệ' })
  userId: string;

  @ApiProperty({
    description: 'Danh sách sản phẩm trong đơn hàng',
    type: [OrderProductDto],
    example: [
      { id: 1, quantity: 2 },
      { id: 2, quantity: 1 },
    ],
  })
  @IsArray()
  @ArrayNotEmpty({ message: 'Products không được rỗng' })
  @ValidateNested({ each: true })
  @Type(() => OrderProductDto)
  products: OrderProductDto[];
}
