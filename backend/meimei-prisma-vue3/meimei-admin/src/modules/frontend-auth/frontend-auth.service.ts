import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'nestjs-prisma';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { ApiException } from 'src/common/exceptions/api.exception';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/req-register.dto';
import { LoginDto } from './dto/req-login.dto';
import { UpdateProfileDto } from './dto/req-update-profile.dto';
import { ChangePasswordDto } from './dto/req-change-password.dto';
import { ForgotPasswordDto } from './dto/req-forgot-password.dto';
import { ResetPasswordDto } from './dto/req-reset-password.dto';
import { CustomerListDto } from './dto/req-customer-list.dto';
import { UpdateCustomerStatusDto } from './dto/req-update-customer-status.dto';
import { EmailService } from '../common/email/email.service';
import { randomBytes } from 'crypto';

@Injectable()
export class FrontendAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    @InjectRedis() private readonly redis: Redis,
    private readonly emailService: EmailService,
  ) {}

  // 登录失败限制配置
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCK_TIME_MINUTES = 10;

  /**
   * 用户注册
   */
  async register(registerDto: RegisterDto) {
    const { userName, nickName, email, phonenumber, password, confirmPassword, sex } = registerDto;

    // 验证两次密码是否一致
    if (password !== confirmPassword) {
      throw new ApiException('两次密码不一致');
    }

    // 检查用户名是否已存在
    const existingUserByName = await this.prisma.customer.findUnique({
      where: { userName },
    });
    if (existingUserByName) {
      throw new ApiException('用户名已被注册');
    }

    // 检查邮箱是否已存在
    const existingUserByEmail = await this.prisma.customer.findUnique({
      where: { email },
    });
    if (existingUserByEmail) {
      throw new ApiException('邮箱已被注册');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const customer = await this.prisma.customer.create({
      data: {
        userName,
        nickName,
        email,
        phonenumber,
        password: hashedPassword,
        sex: sex || '0',
        status: '0',
        delFlag: '0',
      },
    });

    // 生成token
    const token = this.generateToken(customer.customerId, customer.userName);

    // 保存token到Redis
    await this.saveTokenToRedis(customer.customerId, token);

    // 记录登录日志
    await this.recordLoginLog(customer.customerId, customer.userName, '0', '注册成功');

    // 返回用户信息（不包含密码）
    const { password: _, ...userInfo } = customer;

    return {
      token,
      user: userInfo,
    };
  }

  /**
   * 用户登录
   */
  async login(loginDto: LoginDto, ip?: string) {
    const { username, password, rememberMe } = loginDto;

    // 查找用户（支持用户名或邮箱登录）
    const customer = await this.prisma.customer.findFirst({
      where: {
        OR: [
          { userName: username },
          { email: username },
        ],
        delFlag: '0',
      },
    });

    if (!customer) {
      throw new ApiException('用户名或密码错误');
    }

    // 检查账号是否被禁用
    if (customer.status === '1') {
      throw new ApiException('账号已被禁用，请联系管理员');
    }

    // 检查账号是否被锁定
    if (customer.lockUntil && new Date(customer.lockUntil) > new Date()) {
      const remainingMinutes = Math.ceil((new Date(customer.lockUntil).getTime() - Date.now()) / 60000);
      throw new ApiException(`账号已被锁定，请${remainingMinutes}分钟后再试`);
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, customer.password);

    if (!isPasswordValid) {
      // 登录失败，增加失败次数
      await this.handleLoginFailure(customer);
      throw new ApiException('用户名或密码错误');
    }

    // 登录成功，重置失败次数
    await this.prisma.customer.update({
      where: { customerId: customer.customerId },
      data: {
        loginFailCount: 0,
        lockUntil: null,
        loginIp: ip || '',
        loginDate: new Date(),
      },
    });

    // 生成token（记住我：30天，否则：7天）
    const expiresIn = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7;
    const token = this.generateToken(customer.customerId, customer.userName, expiresIn);

    // 保存token到Redis
    await this.saveTokenToRedis(customer.customerId, token, expiresIn);

    // 记录登录日志
    await this.recordLoginLog(customer.customerId, customer.userName, '0', '登录成功', ip);

    // 返回用户信息（不包含密码）
    const { password: _, loginFailCount, lockUntil, ...userInfo } = customer;

    return {
      token,
      user: userInfo,
    };
  }

  /**
   * 处理登录失败
   */
  private async handleLoginFailure(customer: any) {
    const failCount = (customer.loginFailCount || 0) + 1;
    const updateData: any = {
      loginFailCount: failCount,
    };

    // 如果失败次数达到限制，锁定账号
    if (failCount >= this.MAX_LOGIN_ATTEMPTS) {
      const lockUntil = new Date();
      lockUntil.setMinutes(lockUntil.getMinutes() + this.LOCK_TIME_MINUTES);
      updateData.lockUntil = lockUntil;
    }

    await this.prisma.customer.update({
      where: { customerId: customer.customerId },
      data: updateData,
    });

    // 记录登录失败日志
    await this.recordLoginLog(customer.customerId, customer.userName, '1', `登录失败，剩余尝试次数：${this.MAX_LOGIN_ATTEMPTS - failCount}`);
  }

  /**
   * 获取用户信息
   */
  async getProfile(customerId: number) {
    const customer = await this.prisma.customer.findUnique({
      where: { customerId },
    });

    if (!customer || customer.delFlag === '1') {
      throw new ApiException('用户不存在');
    }

    // 返回用户信息（不包含密码和敏感字段）
    const { password, loginFailCount, lockUntil, delFlag, ...userInfo } = customer;
    return userInfo;
  }

  /**
   * 更新用户信息
   */
  async updateProfile(customerId: number, updateProfileDto: UpdateProfileDto) {
    const { email, ...otherData } = updateProfileDto;

    // 如果要更新邮箱，检查邮箱是否已被其他用户使用
    if (email) {
      const existingUser = await this.prisma.customer.findFirst({
        where: {
          email,
          customerId: { not: customerId },
        },
      });
      if (existingUser) {
        throw new ApiException('该邮箱已被其他用户使用');
      }
    }

    // 更新用户信息
    await this.prisma.customer.update({
      where: { customerId },
      data: {
        ...otherData,
        ...(email && { email }),
      },
    });

    return { msg: '更新成功' };
  }

  /**
   * 修改密码
   */
  async changePassword(customerId: number, changePasswordDto: ChangePasswordDto) {
    const { oldPassword, newPassword, confirmPassword } = changePasswordDto;

    // 验证两次密码是否一致
    if (newPassword !== confirmPassword) {
      throw new ApiException('两次密码不一致');
    }

    // 获取用户信息
    const customer = await this.prisma.customer.findUnique({
      where: { customerId },
    });

    if (!customer) {
      throw new ApiException('用户不存在');
    }

    // 验证原密码
    const isPasswordValid = await bcrypt.compare(oldPassword, customer.password);
    if (!isPasswordValid) {
      throw new ApiException('原密码错误');
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 更新密码
    await this.prisma.customer.update({
      where: { customerId },
      data: { password: hashedPassword },
    });

    // 清除Redis中的token（强制重新登录）
    await this.removeTokenFromRedis(customerId);

    return { msg: '密码修改成功，请重新登录' };
  }

  /**
   * 上传头像
   */
  async uploadAvatar(customerId: number, file: Express.Multer.File) {
    if (!file) {
      throw new ApiException('请选择要上传的文件');
    }

    // 验证文件类型
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new ApiException('只支持上传图片文件（jpg, png, gif, webp）');
    }

    // 验证文件大小（最大2MB）
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new ApiException('图片大小不能超过2MB');
    }

    // 生成文件名
    const timestamp = Date.now();
    const randomStr = randomBytes(8).toString('hex');
    const ext = file.originalname.split('.').pop();
    const fileName = `avatar_${customerId}_${timestamp}_${randomStr}.${ext}`;

    // 保存文件路径（这里简化处理，实际应该保存到文件系统或云存储）
    // 在实际项目中，你需要：
    // 1. 使用 fs 模块保存文件到服务器
    // 2. 或者上传到云存储（如阿里云OSS、腾讯云COS、AWS S3等）
    // 3. 返回可访问的URL

    // 这里我们使用 base64 编码作为临时方案
    const avatarUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

    // 更新用户头像
    await this.prisma.customer.update({
      where: { customerId },
      data: { avatar: avatarUrl },
    });

    return { avatar: avatarUrl };
  }

  /**
   * 退出登录
   */
  async logout(customerId: number) {
    // 清除Redis中的token
    await this.removeTokenFromRedis(customerId);
    return { msg: '退出成功' };
  }

  /**
   * 忘记密码 - 发送邮件
   */
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    // 查找用户
    const customer = await this.prisma.customer.findUnique({
      where: { email },
    });

    if (!customer) {
      throw new ApiException('该邮箱未注册');
    }

    // 生成重置令牌
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1小时后过期

    // 保存令牌到数据库
    await this.prisma.passwordResetToken.create({
      data: {
        customerId: customer.customerId,
        email,
        token,
        expiresAt,
        used: 0,
      },
    });

    // 发送邮件
    try {
      await this.emailService.sendPasswordResetEmail(email, token, customer.userName);
      console.log('重置密码邮件已发送到:', email);
    } catch (error) {
      console.error('发送邮件失败:', error);
      // 邮件发送失败，但令牌已生成，返回token用于测试
      console.log('重置密码令牌:', token);
      console.log('重置链接:', `http://localhost:8080/my-account/lost-password/?token=${token}&email=${encodeURIComponent(email)}`);

      // 生产环境应该抛出异常，开发环境返回token方便测试
      return { msg: '重置密码邮件发送失败，但已生成重置令牌（仅开发环境）', token };
    }

    return { msg: '重置密码邮件已发送，请查收', token }; // 生产环境应该删除token
  }

  /**
   * 重置密码
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, email, newPassword, confirmPassword } = resetPasswordDto;

    // 验证两次密码是否一致
    if (newPassword !== confirmPassword) {
      throw new ApiException('两次密码不一致');
    }

    // 查找令牌（同时验证email）
    const resetToken = await this.prisma.passwordResetToken.findFirst({
      where: {
        token,
        email,
      },
    });

    if (!resetToken) {
      throw new ApiException('重置令牌无效或邮箱不匹配');
    }

    // 检查令牌是否已使用
    if (resetToken.used === 1) {
      throw new ApiException('重置令牌已使用');
    }

    // 检查令牌是否过期
    if (new Date(resetToken.expiresAt) < new Date()) {
      throw new ApiException('重置令牌已过期');
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 更新密码
    await this.prisma.customer.update({
      where: { customerId: resetToken.customerId },
      data: { password: hashedPassword },
    });

    // 标记令牌为已使用
    await this.prisma.passwordResetToken.update({
      where: { tokenId: resetToken.tokenId },
      data: { used: 1 },
    });

    return { msg: '密码重置成功' };
  }

  /**
   * 生成JWT Token
   */
  private generateToken(customerId: number, userName: string, expiresIn: number = 60 * 60 * 24 * 7): string {
    return this.jwtService.sign(
      { customerId, userName, type: 'customer' },
      { expiresIn },
    );
  }

  /**
   * 保存Token到Redis
   */
  private async saveTokenToRedis(customerId: number, token: string, expiresIn: number = 60 * 60 * 24 * 7) {
    const key = `customer_token:${customerId}`;
    await this.redis.set(key, token, 'EX', expiresIn);
  }

  /**
   * 从Redis删除Token
   */
  private async removeTokenFromRedis(customerId: number) {
    const key = `customer_token:${customerId}`;
    await this.redis.del(key);
  }

  /**
   * 记录登录日志
   */
  private async recordLoginLog(
    customerId: number,
    userName: string,
    status: string,
    msg: string,
    ip?: string,
  ) {
    await this.prisma.customerLoginLog.create({
      data: {
        customerId,
        userName,
        ipaddr: ip || '',
        loginLocation: '',
        browser: '',
        os: '',
        status,
        msg,
        loginTime: new Date(),
      },
    });
  }

  /**
   * 获取前端用户列表（管理员功能）
   */
  async getCustomerList(query: CustomerListDto) {
    const { pageNum = 1, pageSize = 10, userName, email, phone, status } = query;

    const where: any = {};

    if (userName) {
      where.userName = { contains: userName };
    }

    if (email) {
      where.email = { contains: email };
    }

    if (phone) {
      where.phonenumber = { contains: phone };
    }

    if (status) {
      where.status = status;
    }

    const [rows, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
        orderBy: { createTime: 'desc' },
        select: {
          customerId: true,
          userName: true,
          nickName: true,
          email: true,
          phonenumber: true,
          sex: true,
          avatar: true,
          status: true,
          createTime: true,
          loginDate: true,
          loginIp: true,
        },
      }),
      this.prisma.customer.count({ where }),
    ]);

    return {
      rows,
      total,
    };
  }

  /**
   * 获取单个前端用户详情（管理员功能）
   */
  async getCustomerById(customerId: number) {
    const customer = await this.prisma.customer.findUnique({
      where: { customerId },
      select: {
        customerId: true,
        userName: true,
        nickName: true,
        email: true,
        phonenumber: true,
        sex: true,
        avatar: true,
        status: true,
        createTime: true,
        loginDate: true,
        loginIp: true,
        remark: true,
      },
    });

    if (!customer) {
      throw new ApiException('用户不存在');
    }

    return customer;
  }

  /**
   * 更新前端用户状态（管理员功能）
   */
  async updateCustomerStatus(updateStatusDto: UpdateCustomerStatusDto) {
    const { customerId, status } = updateStatusDto;

    const customer = await this.prisma.customer.findUnique({
      where: { customerId },
    });

    if (!customer) {
      throw new ApiException('用户不存在');
    }

    await this.prisma.customer.update({
      where: { customerId },
      data: { status },
    });

    // 如果禁用用户，删除其 Redis 中的 token
    if (status === '1') {
      const redisKey = `customer_token:${customerId}`;
      await this.redis.del(redisKey);
    }

    return { msg: '状态更新成功' };
  }

  /**
   * 删除前端用户（管理员功能）
   */
  async deleteCustomer(customerId: number) {
    const customer = await this.prisma.customer.findUnique({
      where: { customerId },
    });

    if (!customer) {
      throw new ApiException('用户不存在');
    }

    // 删除用户
    await this.prisma.customer.delete({
      where: { customerId },
    });

    // 删除 Redis 中的 token
    const redisKey = `customer_token:${customerId}`;
    await this.redis.del(redisKey);

    return { msg: '删除成功' };
  }

  /**
   * 批量删除前端用户（管理员功能）
   */
  async deleteCustomers(customerIds: number[]) {
    // 删除用户
    await this.prisma.customer.deleteMany({
      where: {
        customerId: { in: customerIds },
      },
    });

    // 删除 Redis 中的 tokens
    const redisKeys = customerIds.map(id => `customer_token:${id}`);
    if (redisKeys.length > 0) {
      await this.redis.del(...redisKeys);
    }

    return { msg: '批量删除成功' };
  }
}

