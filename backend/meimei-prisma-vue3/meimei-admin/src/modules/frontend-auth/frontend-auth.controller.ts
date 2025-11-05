import { Controller, Post, Get, Put, Delete, Body, Req, UseGuards, UploadedFile, UseInterceptors, Query, Param } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FrontendAuthService } from './frontend-auth.service';
import { RegisterDto } from './dto/req-register.dto';
import { LoginDto } from './dto/req-login.dto';
import { UpdateProfileDto } from './dto/req-update-profile.dto';
import { ChangePasswordDto } from './dto/req-change-password.dto';
import { ForgotPasswordDto } from './dto/req-forgot-password.dto';
import { ResetPasswordDto } from './dto/req-reset-password.dto';
import { CustomerListDto } from './dto/req-customer-list.dto';
import { UpdateCustomerStatusDto } from './dto/req-update-customer-status.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { CustomerJwtAuthGuard } from './guards/customer-jwt-auth.guard';

@Controller('api/frontend/auth')
export class FrontendAuthController {
  constructor(private readonly frontendAuthService: FrontendAuthService) {}

  /**
   * 用户注册
   */
  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.frontendAuthService.register(registerDto);
    return {
      code: 200,
      msg: '注册成功',
      data: result,
    };
  }

  /**
   * 用户登录
   */
  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Req() req: any) {
    const ip = req.ip || req.connection.remoteAddress;
    const result = await this.frontendAuthService.login(loginDto, ip);
    return {
      code: 200,
      msg: '登录成功',
      data: result,
    };
  }

  /**
   * 获取用户信息
   */
  @Public()
  @UseGuards(CustomerJwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: any) {
    const customerId = req.user.customerId;
    const result = await this.frontendAuthService.getProfile(customerId);
    return {
      code: 200,
      msg: '成功',
      data: result,
    };
  }

  /**
   * 更新用户信息
   */
  @Public()
  @UseGuards(CustomerJwtAuthGuard)
  @Put('profile')
  async updateProfile(@Req() req: any, @Body() updateProfileDto: UpdateProfileDto) {
    const customerId = req.user.customerId;
    const result = await this.frontendAuthService.updateProfile(customerId, updateProfileDto);
    return {
      code: 200,
      msg: result.msg,
    };
  }

  /**
   * 修改密码
   */
  @Public()
  @UseGuards(CustomerJwtAuthGuard)
  @Put('password')
  async changePassword(@Req() req: any, @Body() changePasswordDto: ChangePasswordDto) {
    const customerId = req.user.customerId;
    const result = await this.frontendAuthService.changePassword(customerId, changePasswordDto);
    return {
      code: 200,
      msg: result.msg,
    };
  }

  /**
   * 上传头像
   */
  @Public()
  @UseGuards(CustomerJwtAuthGuard)
  @Post('upload-avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    const customerId = req.user.customerId;
    const result = await this.frontendAuthService.uploadAvatar(customerId, file);
    return {
      code: 200,
      msg: 'Avatar uploaded successfully',
      data: {
        avatar: result.avatar,
      },
    };
  }

  /**
   * 退出登录
   */
  @Public()
  @UseGuards(CustomerJwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: any) {
    const customerId = req.user.customerId;
    const result = await this.frontendAuthService.logout(customerId);
    return {
      code: 200,
      msg: result.msg,
    };
  }

  /**
   * 忘记密码 - 发送邮件
   */
  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    const result = await this.frontendAuthService.forgotPassword(forgotPasswordDto);
    return {
      code: 200,
      msg: result.msg,
      data: { token: result.token }, // 生产环境应该删除这行
    };
  }

  /**
   * 重置密码
   */
  @Public()
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    const result = await this.frontendAuthService.resetPassword(resetPasswordDto);
    return {
      code: 200,
      msg: result.msg,
    };
  }

  // ==================== 管理员功能 ====================

  /**
   * 获取前端用户列表（管理员）
   */
  @Get('customers/list')
  async getCustomerList(@Query() query: CustomerListDto) {
    const result = await this.frontendAuthService.getCustomerList(query);
    return {
      code: 200,
      msg: '查询成功',
      rows: result.rows,
      total: result.total,
    };
  }

  /**
   * 获取前端用户详情（管理员）
   */
  @Get('customers/:customerId')
  async getCustomerById(@Param('customerId') customerId: string) {
    const result = await this.frontendAuthService.getCustomerById(Number(customerId));
    return {
      code: 200,
      msg: '查询成功',
      data: result,
    };
  }

  /**
   * 更新前端用户状态（管理员）
   */
  @Put('customers/changeStatus')
  async updateCustomerStatus(@Body() updateStatusDto: UpdateCustomerStatusDto) {
    const result = await this.frontendAuthService.updateCustomerStatus(updateStatusDto);
    return {
      code: 200,
      msg: result.msg,
    };
  }

  /**
   * 删除前端用户（管理员）
   */
  @Delete('customers/:customerIds')
  async deleteCustomers(@Param('customerIds') customerIds: string) {
    const ids = customerIds.split(',').map(id => Number(id));
    const result = await this.frontendAuthService.deleteCustomers(ids);
    return {
      code: 200,
      msg: result.msg,
    };
  }
}

