import { IsString, IsBoolean, IsOptional, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @MinLength(3, { message: '用户名至少3个字符' })
  username: string;

  @IsString()
  @MinLength(6, { message: '密码至少6个字符' })
  password: string;

  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}

