import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

/**
 * 图片处理服务
 * 负责商品图片的上传、生成多尺寸、删除等操作
 */
@Injectable()
export class ImageProcessorService {
  private uploadPath = './static/upload/product';

  /**
   * 处理商品图片上传，自动生成多个尺寸
   * @param file 上传的文件
   * @returns 返回各尺寸图片的路径对象
   */
  async processProductImage(file: Express.Multer.File): Promise<any> {
    // 创建年月目录
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const uploadDir = path.join(this.uploadPath, yearMonth);

    // 确保目录存在
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 生成唯一文件名
    const fileName = uuidv4();
    const ext = '.jpg'; // 统一转换为jpg格式

    // 定义各尺寸（完全匹配前端实际需求）
    const sizes = {
      original: { width: null, height: null, suffix: '', quality: 90, fit: 'inside' },           // 保留原图（最大1200px）
      large_800: { width: 800, height: 877, suffix: '_800x877', quality: 85, fit: 'inside' },    // 商品详情页主图、列表页（保持比例）
      large_768: { width: 768, height: 842, suffix: '_768x842', quality: 85, fit: 'inside' },    // 大屏幕（保持比例）
      medium_600: { width: 600, height: 600, suffix: '_600x600', quality: 85, fit: 'cover' },    // 桌面端商品列表、首页（正方形）
      medium_460: { width: 460, height: 460, suffix: '_460x460', quality: 85, fit: 'cover' },    // 备用尺寸（正方形）
      small_274: { width: 274, height: 300, suffix: '_274x300', quality: 85, fit: 'inside' },    // 移动端（保持比例）
      thumbnail_150: { width: 150, height: 150, suffix: '_150x150', quality: 80, fit: 'cover' }, // 心愿单、购物车（正方形）
      thumbnail_100: { width: 100, height: 100, suffix: '_100x100', quality: 80, fit: 'cover' }  // 详情页左侧缩略图（正方形）
    };

    const result = {};

    // 生成各尺寸图片
    for (const [key, config] of Object.entries(sizes)) {
      const outputFileName = `${fileName}${config.suffix}${ext}`;
      const outputPath = path.join(uploadDir, outputFileName);
      const relativePath = `uploads/product/${yearMonth}/${outputFileName}`;

      let sharpInstance = sharp(file.buffer);

      if (config.width && config.height) {
        // 调整尺寸
        sharpInstance = sharpInstance.resize(config.width, config.height, {
          fit: config.fit as any,        // 'cover'=裁剪为正方形, 'inside'=保持比例
          position: 'center',     // 居中裁剪/对齐
          withoutEnlargement: true
        });
      } else {
        // 原图：限制最大宽度为1200px
        const metadata = await sharp(file.buffer).metadata();
        if (metadata.width > 1200) {
          sharpInstance = sharpInstance.resize(1200, null, {
            fit: 'inside',        // 保持比例，不裁剪
            withoutEnlargement: true
          });
        }
      }

      // 转换为jpg格式，压缩
      await sharpInstance
        .jpeg({ quality: config.quality })
        .toFile(outputPath);

      result[key] = relativePath;
    }

    // 同时生成WebP格式（用于现代浏览器，体积更小30-50%）
    // 生成600x600正方形WebP
    const webp600FileName = `${fileName}_600x600.webp`;
    const webp600Path = path.join(uploadDir, webp600FileName);
    await sharp(file.buffer)
      .resize(600, 600, { fit: 'cover', position: 'center' })
      .webp({ quality: 80 })
      .toFile(webp600Path);
    result['webp_600'] = `uploads/product/${yearMonth}/${webp600FileName}`;

    // 生成768x842保持比例WebP
    const webp768FileName = `${fileName}_768x842.webp`;
    const webp768Path = path.join(uploadDir, webp768FileName);
    await sharp(file.buffer)
      .resize(768, 842, { fit: 'inside', position: 'center' })
      .webp({ quality: 80 })
      .toFile(webp768Path);
    result['webp_768'] = `uploads/product/${yearMonth}/${webp768FileName}`;

    return result;
  }

  /**
   * 删除商品图片（删除所有尺寸）
   * @param imagePath 图片路径对象或主图路径字符串
   */
  async deleteProductImage(imagePath: any): Promise<void> {
    if (typeof imagePath === 'string') {
      // 单个路径字符串
      const fullPath = path.join('./', imagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } else if (typeof imagePath === 'object' && imagePath !== null) {
      // 多尺寸路径对象
      for (const imgPath of Object.values(imagePath)) {
        if (typeof imgPath === 'string') {
          const fullPath = path.join('./', imgPath);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        }
      }
    }
  }

  /**
   * 批量删除商品图片（用于删除商品时）
   * @param mainImage 主图路径对象
   * @param images 多图数组（每个元素是路径对象）
   */
  async deleteProductImages(mainImage: any, images: any[]): Promise<void> {
    // 删除主图
    if (mainImage) {
      await this.deleteProductImage(mainImage);
    }

    // 删除多图
    if (Array.isArray(images)) {
      for (const image of images) {
        await this.deleteProductImage(image);
      }
    }
  }
}

