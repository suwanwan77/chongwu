import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CustomerJwtAuthGuard } from '../frontend-auth/guards/customer-jwt-auth.guard';

/**
 * 订单Controller（需要客户认证）
 */
@Controller('api/orders')
@UseGuards(CustomerJwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  /**
   * 创建订单
   */
  @Post()
  async createOrder(@Request() req: any, @Body() body: any) {
    const customerId = req.user.customerId;
    return await this.orderService.createOrder(customerId, body);
  }

  /**
   * 获取订单列表
   */
  @Get()
  async getOrderList(@Request() req: any, @Query() query: any) {
    const customerId = req.user.customerId;
    return await this.orderService.getOrderList(customerId, query);
  }

  /**
   * 获取订单详情
   */
  @Get(':orderId')
  async getOrderDetail(@Request() req: any, @Param('orderId') orderId: string) {
    const customerId = req.user.customerId;
    return await this.orderService.getOrderDetail(customerId, parseInt(orderId));
  }

  /**
   * 取消订单
   */
  @Put(':orderId/cancel')
  async cancelOrder(@Request() req: any, @Param('orderId') orderId: string) {
    const customerId = req.user.customerId;
    return await this.orderService.cancelOrder(customerId, parseInt(orderId));
  }

  /**
   * 确认收货
   */
  @Put(':orderId/confirm')
  async confirmReceipt(@Request() req: any, @Param('orderId') orderId: string) {
    const customerId = req.user.customerId;
    return await this.orderService.confirmReceipt(customerId, parseInt(orderId));
  }
}

