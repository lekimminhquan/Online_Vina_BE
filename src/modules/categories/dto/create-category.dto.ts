import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên danh mục không được để trống' })
  @MinLength(3, { message: 'Tên danh mục phải có ít nhất 3 ký tự' })
  name: string;
}
