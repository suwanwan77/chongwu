import { IsString, MinLength, MaxLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @MinLength(6, { message: '原密码至少6个字符' })
  oldPassword: string;

  @IsString()
  @MinLength(6, { message: '新密码至少6个字符' })
  @MaxLength(20, { message: '新密码最多20个字符' })
  newPassword: string;

  @IsString()
  @MinLength(6, { message: '确认密码至少6个字符' })
  confirmPassword: string;
}

