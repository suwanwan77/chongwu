import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class CustomerJwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRedis() private readonly redis: Redis,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('未登录或登录已过期');
    }

    try {
      // 验证token
      const payload = this.jwtService.verify(token);

      // 检查是否是前端用户token
      if (payload.type !== 'customer') {
        throw new UnauthorizedException('无效的token类型');
      }

      // 检查Redis中是否存在该token
      const redisKey = `customer_token:${payload.customerId}`;
      const redisToken = await this.redis.get(redisKey);

      if (!redisToken || redisToken !== token) {
        throw new UnauthorizedException('登录状态已过期，请重新登录');
      }

      // 将用户信息附加到request对象
      request.user = payload;

      return true;
    } catch (error) {
      throw new UnauthorizedException('登录状态已过期，请重新登录');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return undefined;
    }

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}

