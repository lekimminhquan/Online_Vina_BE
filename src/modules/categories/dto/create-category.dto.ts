import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Tên danh mục (tối thiểu 3 ký tự)',
    example: 'Điện thoại',
    minLength: 3,
  })
  @IsString()
  @IsNotEmpty({ message: 'Tên danh mục không được để trống' })
  @MinLength(3, { message: 'Tên danh mục phải có ít nhất 3 ký tự' })
  name: string;
}
