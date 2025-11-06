import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { ImageProcessorService } from './image-processor.service';

/**
 * 商品服务
 * 负责商品的增删改查，包含图片处理逻辑
 */
@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    private imageProcessor: ImageProcessorService
  ) {}

  /**
   * 创建商品（含图片上传）
   */
  async createProduct(
    data: any,
    mainImageFile?: Express.Multer.File,
    imageFiles?: Express.Multer.File[]
  ) {
    // 处理主图
    let mainImagePaths = null;
    if (mainImageFile) {
      mainImagePaths = await this.imageProcessor.processProductImage(mainImageFile);
    }

    // 处理多图
    let imagePaths = [];
    if (imageFiles && imageFiles.length > 0) {
      for (const file of imageFiles) {
        const paths = await this.imageProcessor.processProductImage(file);
        imagePaths.push(paths);
      }
    }

    // 创建商品记录
    return await this.prisma.product.create({
      data: {
        ...data,
        mainImage: mainImagePaths ? JSON.stringify(mainImagePaths) : null,  // 存储为JSON字符串
        images: imagePaths.length > 0 ? JSON.stringify(imagePaths) : null,  // 存储为JSON字符串
        createTime: new Date(),
        updateTime: new Date()
      }
    });
  }

  /**
   * 修改商品（含图片更新）
   */
  async updateProduct(
    productId: number,
    data: any,
    mainImageFile?: Express.Multer.File,
    imageFiles?: Express.Multer.File[],
    deleteMainImage?: boolean,  // 是否删除主图
    deleteImageIndexes?: number[]  // 要删除的多图索引
  ) {
    // 获取原商品数据
    const product = await this.prisma.product.findUnique({
      where: { productId }
    });

    if (!product) {
      throw new Error('商品不存在');
    }

    // 解析原图片数据
    let oldMainImage = product.mainImage ? JSON.parse(product.mainImage) : null;
    let oldImages = product.images ? JSON.parse(product.images) : [];

    // 处理主图更新
    let newMainImage = oldMainImage;
    if (deleteMainImage && oldMainImage) {
      // 删除旧主图
      await this.imageProcessor.deleteProductImage(oldMainImage);
      newMainImage = null;
    }
    if (mainImageFile) {
      // 删除旧主图（如果存在）
      if (oldMainImage) {
        await this.imageProcessor.deleteProductImage(oldMainImage);
      }
      // 上传新主图
      newMainImage = await this.imageProcessor.processProductImage(mainImageFile);
    }

    // 处理多图更新
    let newImages = [...oldImages];

    // 删除指定的多图
    if (deleteImageIndexes && deleteImageIndexes.length > 0) {
      for (const index of deleteImageIndexes.sort((a, b) => b - a)) {  // 从后往前删除
        if (index >= 0 && index < newImages.length) {
          await this.imageProcessor.deleteProductImage(newImages[index]);
          newImages.splice(index, 1);
        }
      }
    }

    // 添加新的多图
    if (imageFiles && imageFiles.length > 0) {
      for (const file of imageFiles) {
        const paths = await this.imageProcessor.processProductImage(file);
        newImages.push(paths);
      }
    }

    // 更新商品记录
    return await this.prisma.product.update({
      where: { productId },
      data: {
        ...data,
        mainImage: newMainImage ? JSON.stringify(newMainImage) : null,
        images: newImages.length > 0 ? JSON.stringify(newImages) : null,
        updateTime: new Date()
      }
    });
  }

  /**
   * 删除商品（含图片删除）
   */
  async deleteProduct(productId: number) {
    // 获取商品数据
    const product = await this.prisma.product.findUnique({
      where: { productId }
    });

    if (!product) {
      throw new Error('商品不存在');
    }

    // 解析图片数据
    const mainImage = product.mainImage ? JSON.parse(product.mainImage) : null;
    const images = product.images ? JSON.parse(product.images) : [];

    // 删除所有图片文件
    await this.imageProcessor.deleteProductImages(mainImage, images);

    // 软删除商品记录
    return await this.prisma.product.update({
      where: { productId },
      data: {
        delFlag: '1',
        updateTime: new Date()
      }
    });
  }

  /**
   * 获取商品列表
   */
  async getProductList(params: any) {
    const { page = 1, pageSize = 10, categoryId, status, keyword } = params;
    const skip = (page - 1) * pageSize;

    const where: any = {
      delFlag: '0'
    };

    if (categoryId) {
      where.categoryId = parseInt(categoryId);
    }

    if (status) {
      where.status = status;
    }

    if (keyword) {
      where.OR = [
        { productName: { contains: keyword } },
        { productCode: { contains: keyword } }
      ];
    }

    const [list, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          category: true
        },
        orderBy: {
          createTime: 'desc'
        }
      }),
      this.prisma.product.count({ where })
    ]);

    return {
      list,
      total
    };
  }

  /**
   * 获取商品详情
   */
  async getProductDetail(productId: number) {
    const product = await this.prisma.product.findUnique({
      where: { productId },
      include: {
        category: true
      }
    });

    if (!product) {
      throw new Error('商品不存在');
    }

    // 解析图片JSON
    if (product.mainImage) {
      product.mainImage = JSON.parse(product.mainImage);
    }
    if (product.images) {
      product.images = JSON.parse(product.images);
    }

    return product;
  }

  /**
   * 批量更新商品位置
   */
  async updateProductPositions(positions: any[]) {
    const updates = positions.map(item =>
      this.prisma.product.update({
        where: { productId: item.productId },
        data: {
          displayPosition: item.displayPosition,
          displayOrder: item.displayOrder,
          updateTime: new Date()
        }
      })
    );

    await Promise.all(updates);
    return { success: true };
  }

  /**
   * 获取指定位置的商品列表
   */
  async getProductsByPosition(position: string) {
    const products = await this.prisma.product.findMany({
      where: {
        delFlag: '0',
        status: '0',
        displayPosition: {
          contains: position
        }
      },
      orderBy: {
        displayOrder: 'asc'
      }
    });

    // 解析图片JSON
    return products.map(product => ({
      ...product,
      mainImage: product.mainImage ? JSON.parse(product.mainImage) : null,
      images: product.images ? JSON.parse(product.images) : null
    }));
  }
}

