import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

/**
 * 前端商品服务
 * 提供公开的商品查询功能
 */
@Injectable()
export class FrontendProductService {
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
    if (product.images) {
      try {
        product.images = JSON.parse(product.images);
      } catch (e) {
        product.images = [];
      }
    }
    return product;
  }

  /**
   * 获取商品列表
   */
  async getProductList(params: any) {
    const { page = 1, pageSize = 12, categoryId, keyword, sortBy = 'createTime', sortOrder = 'desc' } = params;
    const skip = (page - 1) * pageSize;

    const where: any = {
      delFlag: '0',
      status: '0'  // 只显示上架的商品
    };

    if (categoryId) {
      where.categoryId = parseInt(categoryId);
    }

    if (keyword) {
      where.OR = [
        { productName: { contains: keyword } },
        { productCode: { contains: keyword } },
        { shortDescription: { contains: keyword } }
      ];
    }

    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [list, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: parseInt(pageSize),
        include: {
          category: {
            select: {
              categoryId: true,
              categoryName: true
            }
          }
        },
        orderBy
      }),
      this.prisma.product.count({ where })
    ]);

    // 解析图片JSON
    const parsedList = list.map(product => this.parseProductImages(product));

    return {
      list: parsedList,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      totalPages: Math.ceil(total / pageSize)
    };
  }

  /**
   * 获取商品详情
   */
  async getProductDetail(productId: number) {
    const product = await this.prisma.product.findFirst({
      where: {
        productId,
        delFlag: '0',
        status: '0'
      },
      include: {
        category: {
          select: {
            categoryId: true,
            categoryName: true
          }
        }
      }
    });

    if (!product) {
      throw new Error('商品不存在或已下架');
    }

    // 增加浏览次数
    await this.prisma.product.update({
      where: { productId },
      data: {
        viewCount: {
          increment: 1
        }
      }
    });

    return this.parseProductImages(product);
  }

  /**
   * 获取指定位置的商品列表
   */
  async getProductsByPosition(position: string, limit: number = 4) {
    const products = await this.prisma.product.findMany({
      where: {
        delFlag: '0',
        status: '0',
        displayPosition: {
          contains: position
        }
      },
      take: limit,
      orderBy: {
        displayOrder: 'asc'
      }
    });

    return products.map(product => this.parseProductImages(product));
  }

  /**
   * 获取相关商品（同分类的其他商品）
   */
  async getRelatedProducts(productId: number, limit: number = 4) {
    // 先获取当前商品的分类
    const currentProduct = await this.prisma.product.findUnique({
      where: { productId },
      select: { categoryId: true }
    });

    if (!currentProduct || !currentProduct.categoryId) {
      return [];
    }

    // 获取同分类的其他商品
    const products = await this.prisma.product.findMany({
      where: {
        delFlag: '0',
        status: '0',
        categoryId: currentProduct.categoryId,
        productId: {
          not: productId  // 排除当前商品
        }
      },
      take: limit,
      orderBy: {
        salesCount: 'desc'  // 按销量排序
      }
    });

    return products.map(product => this.parseProductImages(product));
  }

  /**
   * 获取热销商品
   */
  async getHotProducts(limit: number = 8) {
    const products = await this.prisma.product.findMany({
      where: {
        delFlag: '0',
        status: '0',
        isHot: 1
      },
      take: limit,
      orderBy: {
        salesCount: 'desc'
      }
    });

    return products.map(product => this.parseProductImages(product));
  }

  /**
   * 获取新品
   */
  async getNewProducts(limit: number = 8) {
    const products = await this.prisma.product.findMany({
      where: {
        delFlag: '0',
        status: '0',
        isNew: 1
      },
      take: limit,
      orderBy: {
        createTime: 'desc'
      }
    });

    return products.map(product => this.parseProductImages(product));
  }

  /**
   * 搜索商品
   */
  async searchProducts(params: any) {
    const { 
      keyword, 
      categoryId, 
      minPrice, 
      maxPrice, 
      page = 1, 
      pageSize = 12,
      sortBy = 'createTime',
      sortOrder = 'desc'
    } = params;

    const skip = (page - 1) * pageSize;

    const where: any = {
      delFlag: '0',
      status: '0'
    };

    if (keyword) {
      where.OR = [
        { productName: { contains: keyword } },
        { productCode: { contains: keyword } },
        { shortDescription: { contains: keyword } },
        { description: { contains: keyword } }
      ];
    }

    if (categoryId) {
      where.categoryId = parseInt(categoryId);
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) {
        where.price.gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        where.price.lte = parseFloat(maxPrice);
      }
    }

    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [list, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: parseInt(pageSize),
        include: {
          category: {
            select: {
              categoryId: true,
              categoryName: true
            }
          }
        },
        orderBy
      }),
      this.prisma.product.count({ where })
    ]);

    const parsedList = list.map(product => this.parseProductImages(product));

    return {
      list: parsedList,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      totalPages: Math.ceil(total / pageSize)
    };
  }
}

