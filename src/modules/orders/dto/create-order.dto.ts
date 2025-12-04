import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsPositive,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class OrderProductDto {
  @ApiProperty({
    description: 'ID của product variant',
    example: 1,
    type: Number,
  })
  @IsInt({ message: 'Variant id phải là số nguyên' })
  @IsPositive({ message: 'Variant id phải lớn hơn 0' })
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
    description: 'Mã voucher áp dụng cho đơn hàng (nếu có)',
    example: 'DISCOUNT20K',
    required: false,
    type: String,
  })
  voucherCode?: string;

  @ApiProperty({
    description:
      'Danh sách biến thể sản phẩm (product variants) trong đơn hàng',
    type: [OrderProductDto],
    example: [
      { id: 1, quantity: 2 },
      { id: 5, quantity: 1 },
    ],
  })
  @IsArray()
  @ArrayNotEmpty({ message: 'Products không được rỗng' })
  @ValidateNested({ each: true })
  @Type(() => OrderProductDto)
  products: OrderProductDto[];
}
