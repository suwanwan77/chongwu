import { IsNotEmpty, IsInt, IsString } from 'class-validator';

export class UpdateCustomerStatusDto {
  @IsNotEmpty({ message: '用户ID不能为空' })
  @IsInt()
  customerId: number;

  @IsNotEmpty({ message: '状态不能为空' })
  @IsString()
  status: string;
}

