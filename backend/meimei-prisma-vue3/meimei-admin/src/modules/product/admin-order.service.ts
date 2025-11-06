import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

/**
 * 订单服务（后台管理）
 */
@Injectable()
export class AdminOrderService {
  constructor(private prisma: PrismaService) {}

  /**
   * 获取订单列表
   */
  async getOrderList(params: any) {
    const { page = 1, pageSize = 10, orderNumber, status, paymentStatus } = params;

    const where: any = {
      delFlag: '0'
    };

    if (orderNumber) {
      where.orderNumber = {
        contains: orderNumber
      };
    }

    if (status) {
      where.status = status;
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    const [list, total] = await Promise.all([
      this.prisma.customerOrder.findMany({
        where,
        include: {
          customer: {
            select: {
              customerId: true,
              customerName: true,
              email: true,
              phone: true
            }
          }
        },
        orderBy: {
          createTime: 'desc'
        },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      this.prisma.customerOrder.count({ where })
    ]);

    return {
      list,
      total,
      page,
      pageSize
    };
  }

  /**
   * 获取订单详情
   */
  async getOrderDetail(orderId: number) {
    const order = await this.prisma.customerOrder.findFirst({
      where: {
        orderId,
        delFlag: '0'
      },
      include: {
        customer: {
          select: {
            customerId: true,
            customerName: true,
            email: true,
            phone: true
          }
        },
        orderItems: {
          include: {
            product: {
              select: {
                productId: true,
                productName: true,
                productCode: true,
                mainImage: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      throw new Error('订单不存在');
    }

    // 解析商品图片JSON
    if (order.orderItems) {
      order.orderItems.forEach(item => {
        if (item.product && item.product.mainImage) {
          try {
            item.product.mainImage = JSON.parse(item.product.mainImage as string);
          } catch (e) {
            // 保持原值
          }
        }
      });
    }

    return order;
  }

  /**
   * 订单发货
   */
  async shipOrder(orderId: number, shippingCompany: string, trackingNumber: string) {
    const order = await this.prisma.customerOrder.findFirst({
      where: {
        orderId,
        delFlag: '0'
      }
    });

    if (!order) {
      throw new Error('订单不存在');
    }

    if (order.status !== '1') {
      throw new Error('订单状态不正确，无法发货');
    }

    if (order.paymentStatus !== '1') {
      throw new Error('订单未支付，无法发货');
    }

    return await this.prisma.customerOrder.update({
      where: { orderId },
      data: {
        status: '2', // 已发货
        shippingStatus: '1', // 已发货
        shippingCompany,
        trackingNumber,
        shippingTime: new Date(),
        updateTime: new Date()
      }
    });
  }

  /**
   * 更新订单状态
   */
  async updateOrderStatus(orderId: number, status: string) {
    const order = await this.prisma.customerOrder.findFirst({
      where: {
        orderId,
        delFlag: '0'
      }
    });

    if (!order) {
      throw new Error('订单不存在');
    }

    return await this.prisma.customerOrder.update({
      where: { orderId },
      data: {
        status,
        updateTime: new Date()
      }
    });
  }
}

