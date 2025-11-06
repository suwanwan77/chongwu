import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards
} from '@nestjs/common';
import { AdminOrderService } from './admin-order.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * 订单Controller（后台管理）
 */
@Controller('system/product/order')
@UseGuards(JwtAuthGuard)
export class AdminOrderController {
  constructor(private readonly adminOrderService: AdminOrderService) {}

  /**
   * 获取订单列表
   */
  @Get('list')
  async getOrderList(@Query() query: any) {
    const data = await this.adminOrderService.getOrderList(query);
    return { code: 200, msg: '查询成功', data };
  }

  /**
   * 获取订单详情
   */
  @Get(':id')
  async getOrderDetail(@Param('id') id: string) {
    const data = await this.adminOrderService.getOrderDetail(parseInt(id));
    return { code: 200, msg: '查询成功', data };
  }

  /**
   * 订单发货
   */
  @Post('ship')
  async shipOrder(@Body() body: any) {
    const { orderId, shippingCompany, trackingNumber } = body;
    const data = await this.adminOrderService.shipOrder(
      orderId,
      shippingCompany,
      trackingNumber
    );
    return { code: 200, msg: '发货成功', data };
  }

  /**
   * 更新订单状态
   */
  @Put('status')
  async updateOrderStatus(@Body() body: any) {
    const { orderId, status } = body;
    const data = await this.adminOrderService.updateOrderStatus(orderId, status);
    return { code: 200, msg: '更新成功', data };
  }
}

