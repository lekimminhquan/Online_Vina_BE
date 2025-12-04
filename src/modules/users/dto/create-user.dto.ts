import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserType } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({
    description: 'Email của user',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    description: 'Mật khẩu (tối thiểu 6 ký tự)',
    example: 'password123',
    minLength: 6,
  })
  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @ApiProperty({
    description: 'Tên user',
    required: false,
    example: 'Nguyễn Văn A',
  })
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'URL avatar',
    required: false,
    example: 'https://example.com/avatar.jpg',
  })
  @IsOptional()
  avatar?: string;

  @ApiProperty({
    description: 'Loại user',
    required: false,
    enum: UserType,
    example: UserType.client,
  })
  @IsOptional()
  @IsEnum(UserType)
  user_type?: UserType;

  @ApiProperty({
    description: 'Trạng thái disabled',
    required: false,
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  disabled?: boolean;
}
