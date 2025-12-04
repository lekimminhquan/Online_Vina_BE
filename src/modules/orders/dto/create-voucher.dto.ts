import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateVoucherDto {
  @ApiProperty({
    description: 'Mã voucher, duy nhất',
    example: 'DISCOUNT20K',
  })
  @IsString()
  @IsNotEmpty({ message: 'code không được để trống' })
  code: string;

  @ApiProperty({
    description: 'Số tiền giảm (đơn vị giống đơn hàng)',
    example: 20000,
    type: Number,
  })
  @IsNumber()
  @IsPositive({ message: 'amount phải lớn hơn 0' })
  amount: number;

  @ApiProperty({
    description: 'Mô tả voucher',
    example: 'Giảm 20k cho đơn bất kỳ',
    required: false,
  })
  @IsString()
  description?: string;
}
