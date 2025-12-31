import { Transform } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../../utils/types/pagination-query.dto';

export class ProductListQueryDto extends PaginationQueryDto {
  @ApiProperty({
    description: 'Lọc theo ID danh mục',
    required: false,
    example: 1,
    type: Number,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value !== undefined ? parseInt(value, 10) : undefined,
  )
  @IsInt()
  categoryId?: number;
}
