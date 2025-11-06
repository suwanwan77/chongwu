import {
  Controller,
  Get,
  Param,
  Query
} from '@nestjs/common';
import { FrontendProductService } from './frontend-product.service';

/**
 * 前端商品Controller（公开访问，不需要认证）
 */
@Controller('api/products')
export class FrontendProductController {
  constructor(private readonly frontendProductService: FrontendProductService) {}

  /**
   * 获取商品列表（支持分类、位置、关键词筛选）
   */
  @Get()
  async getProductList(@Query() query: any) {
    return await this.frontendProductService.getProductList(query);
  }

  /**
   * 获取商品详情
   */
  @Get(':id')
  async getProductDetail(@Param('id') id: string) {
    return await this.frontendProductService.getProductDetail(parseInt(id));
  }

  /**
   * 获取首页精选商品（最多4个）
   */
  @Get('featured/home')
  async getFeaturedProducts() {
    return await this.frontendProductService.getProductsByPosition('home_featured', 4);
  }

  /**
   * 获取相关商品（最多4个）
   */
  @Get('related/:productId')
  async getRelatedProducts(@Param('productId') productId: string) {
    return await this.frontendProductService.getRelatedProducts(parseInt(productId), 4);
  }

  /**
   * 获取热销商品
   */
  @Get('hot/list')
  async getHotProducts(@Query('limit') limit?: string) {
    return await this.frontendProductService.getHotProducts(parseInt(limit) || 8);
  }

  /**
   * 获取新品
   */
  @Get('new/list')
  async getNewProducts(@Query('limit') limit?: string) {
    return await this.frontendProductService.getNewProducts(parseInt(limit) || 8);
  }

  /**
   * 搜索商品
   */
  @Get('search')
  async searchProducts(@Query() query: any) {
    return await this.frontendProductService.searchProducts(query);
  }
}

