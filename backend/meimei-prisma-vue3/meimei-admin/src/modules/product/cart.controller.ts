import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request
} from '@nestjs/common';
import { CartService } from './cart.service';
import { CustomerJwtAuthGuard } from '../frontend-auth/guards/customer-jwt-auth.guard';

/**
 * 购物车Controller（需要客户认证）
 */
@Controller('api/cart')
@UseGuards(CustomerJwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  /**
   * 获取购物车列表
   */
  @Get()
  async getCartList(@Request() req: any) {
    const customerId = req.user.customerId;
    return await this.cartService.getCartList(customerId);
  }

  /**
   * 添加商品到购物车
   */
  @Post()
  async addToCart(@Request() req: any, @Body() body: any) {
    const customerId = req.user.customerId;
    const { productId, quantity = 1 } = body;
    return await this.cartService.addToCart(customerId, parseInt(productId), parseInt(quantity));
  }

  /**
   * 更新购物车商品数量
   */
  @Put(':cartId')
  async updateCartQuantity(
    @Request() req: any,
    @Param('cartId') cartId: string,
    @Body() body: any
  ) {
    const customerId = req.user.customerId;
    const { quantity } = body;
    return await this.cartService.updateCartQuantity(customerId, parseInt(cartId), parseInt(quantity));
  }

  /**
   * 删除购物车商品
   */
  @Delete(':cartId')
  async removeFromCart(@Request() req: any, @Param('cartId') cartId: string) {
    const customerId = req.user.customerId;
    return await this.cartService.removeFromCart(customerId, parseInt(cartId));
  }

  /**
   * 清空购物车
   */
  @Delete()
  async clearCart(@Request() req: any) {
    const customerId = req.user.customerId;
    return await this.cartService.clearCart(customerId);
  }

  /**
   * 批量删除购物车商品
   */
  @Post('batch-remove')
  async batchRemoveFromCart(@Request() req: any, @Body() body: any) {
    const customerId = req.user.customerId;
    const { cartIds } = body;
    return await this.cartService.batchRemoveFromCart(customerId, cartIds);
  }
}

