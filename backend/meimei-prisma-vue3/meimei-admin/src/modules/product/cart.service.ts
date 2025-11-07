import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';

/**
 * 购物车服务
 * 每个用户只能访问自己的购物车
 */
@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

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
   * 添加商品到购物车
   */
  async addToCart(customerId: number, productId: number, quantity: number = 1) {
    // 检查商品是否存在且上架
    const product = await this.prisma.product.findFirst({
      where: {
        productId,
        delFlag: '0',
        status: '0'
      }
    });

    if (!product) {
      throw new Error('商品不存在或已下架');
    }

    // 检查库存
    if (product.stock < quantity) {
      throw new Error('库存不足');
    }

    // 检查购物车中是否已存在该商品
    const existingCart = await this.prisma.shoppingCart.findFirst({
      where: {
        customerId,
        productId
      }
    });

    if (existingCart) {
      // 更新数量
      const newQuantity = existingCart.quantity + quantity;
      if (product.stock < newQuantity) {
        throw new Error('库存不足');
      }

      return await this.prisma.shoppingCart.update({
        where: { cartId: existingCart.cartId },
        data: {
          quantity: newQuantity,
          updateTime: new Date()
        }
      });
    } else {
      // 新增购物车记录
      return await this.prisma.shoppingCart.create({
        data: {
          customerId,
          productId,
          quantity,
          createTime: new Date(),
          updateTime: new Date()
        }
      });
    }
  }

  /**
   * 获取购物车列表
   */
  async getCartList(customerId: number) {
    const cartItems = await this.prisma.shoppingCart.findMany({
      where: {
        customerId
      },
      include: {
        product: {
          select: {
            productId: true,
            productName: true,
            productCode: true,
            price: true,
            originalPrice: true,
            stock: true,
            mainImage: true,
            status: true,
            delFlag: true
          }
        }
      },
      orderBy: {
        createTime: 'desc'
      }
    });

    // 解析图片JSON并计算小计
    const parsedItems = cartItems.map(item => {
      const product = this.parseProductImages(item.product);
      return {
        ...item,
        product,
        subtotal: parseFloat(product.price.toString()) * item.quantity,
        isAvailable: product.status === '0' && product.delFlag === '0' && product.stock >= item.quantity
      };
    });

    // 计算总价（只计算可用的商品）
    const total = parsedItems
      .filter(item => item.isAvailable)
      .reduce((sum, item) => sum + item.subtotal, 0);

    return {
      items: parsedItems,
      total,
      totalItems: parsedItems.length,
      availableItems: parsedItems.filter(item => item.isAvailable).length
    };
  }

  /**
   * 更新购物车商品数量
   */
  async updateCartQuantity(customerId: number, cartId: number, quantity: number) {
    // 验证购物车是否属于当前用户
    const cart = await this.prisma.shoppingCart.findFirst({
      where: {
        cartId,
        customerId
      },
      include: {
        product: true
      }
    });

    if (!cart) {
      throw new Error('购物车记录不存在');
    }

    // 检查库存
    if (cart.product.stock < quantity) {
      throw new Error('库存不足');
    }

    return await this.prisma.shoppingCart.update({
      where: { cartId },
      data: {
        quantity,
        updateTime: new Date()
      }
    });
  }

  /**
   * 删除购物车商品
   */
  async removeFromCart(customerId: number, cartId: number) {
    // 验证购物车是否属于当前用户
    const cart = await this.prisma.shoppingCart.findFirst({
      where: {
        cartId,
        customerId
      }
    });

    if (!cart) {
      throw new Error('购物车记录不存在');
    }

    return await this.prisma.shoppingCart.delete({
      where: { cartId }
    });
  }

  /**
   * 清空购物车
   */
  async clearCart(customerId: number) {
    return await this.prisma.shoppingCart.deleteMany({
      where: {
        customerId
      }
    });
  }

  /**
   * 批量删除购物车商品
   */
  async batchRemoveFromCart(customerId: number, cartIds: number[]) {
    // 验证所有购物车记录都属于当前用户
    const count = await this.prisma.shoppingCart.count({
      where: {
        cartId: { in: cartIds },
        customerId
      }
    });

    if (count !== cartIds.length) {
      throw new Error('部分购物车记录不存在或无权限');
    }

    return await this.prisma.shoppingCart.deleteMany({
      where: {
        cartId: { in: cartIds },
        customerId
      }
    });
  }
}

