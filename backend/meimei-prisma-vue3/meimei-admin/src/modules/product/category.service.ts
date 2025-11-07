import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';

/**
 * 商品分类服务
 */
@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  /**
   * 获取分类列表（树形结构）
   */
  async getCategoryList(params: any) {
    const { categoryName, status } = params;

    const where: any = {
      delFlag: '0'
    };

    if (categoryName) {
      where.categoryName = {
        contains: categoryName
      };
    }

    if (status) {
      where.status = status;
    }

    const categories = await this.prisma.productCategory.findMany({
      where,
      orderBy: [
        { sort: 'asc' },
        { createTime: 'desc' }
      ]
    });

    return categories;
  }

  /**
   * 获取分类详情
   */
  async getCategoryDetail(categoryId: number) {
    const category = await this.prisma.productCategory.findFirst({
      where: {
        categoryId,
        delFlag: '0'
      }
    });

    if (!category) {
      throw new Error('分类不存在');
    }

    return category;
  }

  /**
   * 创建分类
   */
  async createCategory(data: any) {
    // 计算层级
    let level = 1;
    if (data.parentId && data.parentId !== 0) {
      const parent = await this.prisma.productCategory.findUnique({
        where: { categoryId: data.parentId }
      });
      if (parent) {
        level = (parent.level || 1) + 1;
      }
    }

    return await this.prisma.productCategory.create({
      data: {
        ...data,
        level,
        delFlag: '0',
        createTime: new Date(),
        updateTime: new Date()
      }
    });
  }

  /**
   * 更新分类
   */
  async updateCategory(categoryId: number, data: any) {
    const category = await this.prisma.productCategory.findFirst({
      where: {
        categoryId,
        delFlag: '0'
      }
    });

    if (!category) {
      throw new Error('分类不存在');
    }

    // 如果修改了父级，重新计算层级
    let level = category.level;
    if (data.parentId !== undefined && data.parentId !== category.parentId) {
      if (data.parentId === 0) {
        level = 1;
      } else {
        const parent = await this.prisma.productCategory.findUnique({
          where: { categoryId: data.parentId }
        });
        if (parent) {
          level = (parent.level || 1) + 1;
        }
      }
    }

    return await this.prisma.productCategory.update({
      where: { categoryId },
      data: {
        ...data,
        level,
        updateTime: new Date()
      }
    });
  }

  /**
   * 删除分类
   */
  async deleteCategory(categoryId: number) {
    // 检查是否有子分类
    const childCount = await this.prisma.productCategory.count({
      where: {
        parentId: categoryId,
        delFlag: '0'
      }
    });

    if (childCount > 0) {
      throw new Error('存在子分类，无法删除');
    }

    // 检查是否有商品使用该分类
    const productCount = await this.prisma.product.count({
      where: {
        categoryId,
        delFlag: '0'
      }
    });

    if (productCount > 0) {
      throw new Error('该分类下有商品，无法删除');
    }

    // 软删除
    return await this.prisma.productCategory.update({
      where: { categoryId },
      data: {
        delFlag: '1',
        updateTime: new Date()
      }
    });
  }
}

