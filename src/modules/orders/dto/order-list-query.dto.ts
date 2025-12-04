import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../../utils/types/pagination-query.dto';

export class OrderListQueryDto extends PaginationQueryDto {
  @ApiProperty({
    description: 'Lọc theo ID người dùng (UUID)',
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String,
  })
  @IsOptional()
  @IsString()
  @IsUUID('4', { message: 'UserId phải là UUID hợp lệ' })
  userId?: string;
}
