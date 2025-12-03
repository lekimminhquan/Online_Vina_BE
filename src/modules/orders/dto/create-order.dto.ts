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

export class OrderProductDto {
  @IsInt({ message: 'Product id phải là số nguyên' })
  @IsPositive({ message: 'Product id phải lớn hơn 0' })
  id: number;

  @IsInt({ message: 'Quantity phải là số nguyên' })
  @IsPositive({ message: 'Quantity phải lớn hơn 0' })
  quantity: number;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty({ message: 'UserId không được để trống' })
  @IsUUID('4', { message: 'UserId phải là UUID hợp lệ' })
  userId: string;

  @IsArray()
  @ArrayNotEmpty({ message: 'Products không được rỗng' })
  @ValidateNested({ each: true })
  @Type(() => OrderProductDto)
  products: OrderProductDto[];
}
