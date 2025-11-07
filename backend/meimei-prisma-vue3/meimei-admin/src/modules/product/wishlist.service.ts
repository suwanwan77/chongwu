import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';

/**
 * 心愿单服务
 * 每个用户只能访问自己的心愿单
 */
@Injectable()
export class WishlistService {
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
   * 添加商品到心愿单
   */
  async addToWishlist(customerId: number, productId: number) {
    // 检查商品是否存在
    const product = await this.prisma.product.findFirst({
      where: {
        productId,
        delFlag: '0'
      }
    });

    if (!product) {
      throw new Error('商品不存在');
    }

    // 检查是否已在心愿单中
    const existing = await this.prisma.wishlist.findFirst({
      where: {
        customerId,
        productId
      }
    });

    if (existing) {
      throw new Error('商品已在心愿单中');
    }

    return await this.prisma.wishlist.create({
      data: {
        customerId,
        productId,
        createTime: new Date()
      }
    });
  }

  /**
   * 获取心愿单列表
   */
  async getWishlist(customerId: number) {
    const wishlistItems = await this.prisma.wishlist.findMany({
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
            delFlag: true,
            shortDescription: true
          }
        }
      },
      orderBy: {
        createTime: 'desc'
      }
    });

    // 解析图片JSON
    const parsedItems = wishlistItems.map(item => ({
      ...item,
      product: this.parseProductImages(item.product),
      isAvailable: item.product.status === '0' && item.product.delFlag === '0'
    }));

    return {
      items: parsedItems,
      total: parsedItems.length
    };
  }

  /**
   * 从心愿单移除商品
   */
  async removeFromWishlist(customerId: number, wishlistId: number) {
    // 验证心愿单记录是否属于当前用户
    const wishlist = await this.prisma.wishlist.findFirst({
      where: {
        wishlistId,
        customerId
      }
    });

    if (!wishlist) {
      throw new Error('心愿单记录不存在');
    }

    return await this.prisma.wishlist.delete({
      where: { wishlistId }
    });
  }

  /**
   * 清空心愿单
   */
  async clearWishlist(customerId: number) {
    return await this.prisma.wishlist.deleteMany({
      where: {
        customerId
      }
    });
  }

  /**
   * 检查商品是否在心愿单中
   */
  async isInWishlist(customerId: number, productId: number): Promise<boolean> {
    const count = await this.prisma.wishlist.count({
      where: {
        customerId,
        productId
      }
    });

    return count > 0;
  }

  /**
   * 批量添加到心愿单
   */
  async batchAddToWishlist(customerId: number, productIds: number[]) {
    // 检查哪些商品已在心愿单中
    const existing = await this.prisma.wishlist.findMany({
      where: {
        customerId,
        productId: { in: productIds }
      },
      select: { productId: true }
    });

    const existingIds = existing.map(item => item.productId);
    const newProductIds = productIds.filter(id => !existingIds.includes(id));

    if (newProductIds.length === 0) {
      return { added: 0, message: '所有商品已在心愿单中' };
    }

    // 批量创建
    const data = newProductIds.map(productId => ({
      customerId,
      productId,
      createTime: new Date()
    }));

    await this.prisma.wishlist.createMany({
      data
    });

    return {
      added: newProductIds.length,
      message: `成功添加${newProductIds.length}个商品到心愿单`
    };
  }
}

