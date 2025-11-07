import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';

/**
 * 订单服务
 * 每个用户只能访问自己的订单
 */
@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  /**
   * 生成订单号
   */
  private generateOrderNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    return `ORD${year}${month}${day}${hour}${minute}${second}${random}`;
  }

  /**
   * 解析商品图片JSON
   */
  private parseProductImages(product: any) {
    if (product.mainImage) {
      try {
        product.mainImage = JSON.parse(product.mainImage);
      } catch (e) {
        product.mainImage = null;
      }
    }
    return product;
  }

  /**
   * 创建订单
   */
  async createOrder(customerId: number, data: any) {
    const { addressId, items, remark, paymentMethod } = data;

    // 验证地址
    const address = await this.prisma.customerAddress.findFirst({
      where: {
        addressId,
        customerId,
        delFlag: '0'
      }
    });

    if (!address) {
      throw new Error('收货地址不存在');
    }

    // 验证商品并计算总价
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await this.prisma.product.findFirst({
        where: {
          productId: item.productId,
          delFlag: '0',
          status: '0'
        }
      });

      if (!product) {
        throw new Error(`商品${item.productId}不存在或已下架`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`商品${product.productName}库存不足`);
      }

      const subtotal = parseFloat(product.price.toString()) * item.quantity;
      totalAmount += subtotal;

      orderItems.push({
        productId: item.productId,
        productName: product.productName,
        productCode: product.productCode,
        price: product.price,
        quantity: item.quantity,
        subtotal,
        createTime: new Date()
      });
    }

    // 生成订单号
    const orderNumber = this.generateOrderNumber();

    // 创建订单（使用事务）
    const order = await this.prisma.$transaction(async (tx) => {
      // 创建订单
      const newOrder = await tx.customerOrder.create({
        data: {
          customerId,
          orderNo: orderNumber,
          addressId,
          totalAmount,
          paymentMethod: paymentMethod || 'Credit Card',
          orderStatus: '0',  // 待支付
          paymentStatus: '0',  // 未支付
          remark: remark || `收货地址: ${address.streetAddress}, ${address.suburb || ''}, ${address.city}, ${address.region || ''} ${address.postalCode}`,
          createTime: new Date(),
          updateTime: new Date()
        }
      });

      // 创建订单明细
      for (const item of orderItems) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.orderId,
            ...item
          }
        });
      }

      // 扣减库存
      for (const item of items) {
        await tx.product.update({
          where: { productId: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            },
            salesCount: {
              increment: item.quantity
            }
          }
        });
      }

      // 清空购物车中已下单的商品
      if (items.length > 0) {
        const productIds = items.map(item => item.productId);
        await tx.shoppingCart.deleteMany({
          where: {
            customerId,
            productId: { in: productIds }
          }
        });
      }

      return newOrder;
    });

    return order;
  }

  /**
   * 获取订单列表
   */
  async getOrderList(customerId: number, params: any) {
    const { page = 1, pageSize = 10, status } = params;
    const skip = (page - 1) * pageSize;

    const where: any = {
      customerId,
      delFlag: '0'
    };

    if (status) {
      where.status = status;
    }

    const [list, total] = await Promise.all([
      this.prisma.customerOrder.findMany({
        where,
        skip,
        take: parseInt(pageSize),
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  mainImage: true
                }
              }
            }
          }
        },
        orderBy: {
          createTime: 'desc'
        }
      }),
      this.prisma.customerOrder.count({ where })
    ]);

    // 解析图片JSON
    const parsedList = list.map(order => ({
      ...order,
      orderItems: order.orderItems.map(item => ({
        ...item,
        product: item.product ? this.parseProductImages(item.product) : null
      }))
    }));

    return {
      list: parsedList,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      totalPages: Math.ceil(total / pageSize)
    };
  }

  /**
   * 获取订单详情
   */
  async getOrderDetail(customerId: number, orderId: number) {
    const order = await this.prisma.customerOrder.findFirst({
      where: {
        orderId,
        customerId,
        delFlag: '0'
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
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

    // 解析图片JSON
    return {
      ...order,
      orderItems: order.orderItems.map(item => ({
        ...item,
        product: item.product ? this.parseProductImages(item.product) : null
      }))
    };
  }

  /**
   * 取消订单
   */
  async cancelOrder(customerId: number, orderId: number) {
    const order = await this.prisma.customerOrder.findFirst({
      where: {
        orderId,
        customerId,
        delFlag: '0'
      },
      include: {
        orderItems: true
      }
    });

    if (!order) {
      throw new Error('订单不存在');
    }

    // 只有待支付的订单可以取消
    if (order.orderStatus !== '0') {
      throw new Error('只有待支付的订单可以取消');
    }

    // 使用事务
    return await this.prisma.$transaction(async (tx) => {
      // 更新订单状态
      await tx.customerOrder.update({
        where: { orderId },
        data: {
          orderStatus: '5',  // 已取消
          updateTime: new Date()
        }
      });

      // 恢复库存
      for (const item of order.orderItems) {
        await tx.product.update({
          where: { productId: item.productId },
          data: {
            stock: {
              increment: item.quantity
            },
            salesCount: {
              decrement: item.quantity
            }
          }
        });
      }

      return { success: true, message: '订单已取消' };
    });
  }

  /**
   * 确认收货
   */
  async confirmReceipt(customerId: number, orderId: number) {
    const order = await this.prisma.customerOrder.findFirst({
      where: {
        orderId,
        customerId,
        delFlag: '0'
      }
    });

    if (!order) {
      throw new Error('订单不存在');
    }

    // 只有已发货的订单可以确认收货
    if (order.orderStatus !== '2') {
      throw new Error('只有已发货的订单可以确认收货');
    }

    return await this.prisma.customerOrder.update({
      where: { orderId },
      data: {
        orderStatus: '3',  // 已完成
        completeTime: new Date(),
        updateTime: new Date()
      }
    });
  }
}

