import { IsString, IsEmail, MinLength, MaxLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  token: string;

  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;

  @IsString()
  @MinLength(6, { message: '新密码至少6个字符' })
  @MaxLength(20, { message: '新密码最多20个字符' })
  newPassword: string;

  @IsString()
  @MinLength(6, { message: '确认密码至少6个字符' })
  confirmPassword: string;
}

