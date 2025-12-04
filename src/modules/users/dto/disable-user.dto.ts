import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DisableUserDto {
  @ApiProperty({
    description: 'Trạng thái disabled (true = vô hiệu hóa, false = kích hoạt)',
    example: false,
  })
  @IsBoolean()
  disabled!: boolean;
}
