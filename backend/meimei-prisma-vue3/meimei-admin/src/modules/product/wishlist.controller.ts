import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { CustomerJwtAuthGuard } from '../frontend-auth/guards/customer-jwt-auth.guard';

/**
 * 心愿单Controller（需要客户认证）
 */
@Controller('api/wishlist')
@UseGuards(CustomerJwtAuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  /**
   * 获取心愿单列表
   */
  @Get()
  async getWishlist(@Request() req: any) {
    const customerId = req.user.customerId;
    return await this.wishlistService.getWishlist(customerId);
  }

  /**
   * 添加商品到心愿单
   */
  @Post()
  async addToWishlist(@Request() req: any, @Body() body: any) {
    const customerId = req.user.customerId;
    const { productId } = body;
    return await this.wishlistService.addToWishlist(customerId, parseInt(productId));
  }

  /**
   * 从心愿单移除商品
   */
  @Delete(':wishlistId')
  async removeFromWishlist(@Request() req: any, @Param('wishlistId') wishlistId: string) {
    const customerId = req.user.customerId;
    return await this.wishlistService.removeFromWishlist(customerId, parseInt(wishlistId));
  }

  /**
   * 清空心愿单
   */
  @Delete()
  async clearWishlist(@Request() req: any) {
    const customerId = req.user.customerId;
    return await this.wishlistService.clearWishlist(customerId);
  }

  /**
   * 检查商品是否在心愿单中
   */
  @Get('check/:productId')
  async isInWishlist(@Request() req: any, @Param('productId') productId: string) {
    const customerId = req.user.customerId;
    const isInWishlist = await this.wishlistService.isInWishlist(customerId, parseInt(productId));
    return { isInWishlist };
  }

  /**
   * 批量添加到心愿单
   */
  @Post('batch')
  async batchAddToWishlist(@Request() req: any, @Body() body: any) {
    const customerId = req.user.customerId;
    const { productIds } = body;
    return await this.wishlistService.batchAddToWishlist(customerId, productIds);
  }
}

