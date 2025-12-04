import { IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Token reset password',
    example: 'reset-token-123456',
  })
  @IsNotEmpty()
  token!: string;

  @ApiProperty({
    description: 'Mật khẩu mới (tối thiểu 6 ký tự)',
    example: 'newpassword123',
    minLength: 6,
  })
  @IsNotEmpty()
  @MinLength(6)
  newPassword!: string;
}
