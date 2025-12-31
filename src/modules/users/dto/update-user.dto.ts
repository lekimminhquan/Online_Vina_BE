import { IsEmail, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserType } from '@prisma/client';

export class UpdateUserDto {
  @ApiProperty({
    description: 'Email của user',
    required: false,
    example: 'user@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

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
  })
  @IsOptional()
  @IsBoolean()
  disabled?: boolean;
}
