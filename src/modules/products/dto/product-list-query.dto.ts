import { Transform } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../utils/types/pagination-query.dto';

export class ProductListQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Transform(({ value }) =>
    value !== undefined ? parseInt(value, 10) : undefined,
  )
  @IsInt()
  categoryId?: number;
}
