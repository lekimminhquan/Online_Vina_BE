import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserType } from '@prisma/client';
import { PaginationQueryDto } from '../../../utils/types/pagination-query.dto';

export class UserListQueryDto extends PaginationQueryDto {
  @ApiProperty({
    description: 'Lọc theo trạng thái active (true = không bị disabled)',
    required: false,
    example: true,
    type: Boolean,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value !== undefined ? value === 'true' : undefined,
  )
  @IsBoolean()
  active?: boolean;

  @ApiProperty({
    description: 'Lọc theo loại user',
    required: false,
    enum: UserType,
    example: UserType.client,
  })
  @IsOptional()
  @IsEnum(UserType)
  user_type?: UserType;
}
