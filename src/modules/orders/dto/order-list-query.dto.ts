import { IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../utils/types/pagination-query.dto';

export class OrderListQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @IsUUID('4', { message: 'UserId phải là UUID hợp lệ' })
  userId?: string;
}
