import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ProductService } from './product.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * 商品管理Controller（后台管理）
 */
@Controller('system/product')
@UseGuards(JwtAuthGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  /**
   * 获取商品列表
   */
  @Get('list')
  async getProductList(@Query() query: any) {
    return await this.productService.getProductList(query);
  }

  /**
   * 获取商品详情
   */
  @Get(':id')
  async getProductDetail(@Param('id') id: string) {
    return await this.productService.getProductDetail(parseInt(id));
  }

  /**
   * 创建商品
   */
  @Post()
  @UseInterceptors(
    FileInterceptor('mainImage'),
    FilesInterceptor('images', 10)
  )
  async createProduct(
    @Body() data: any,
    @UploadedFile() mainImage?: Express.Multer.File,
    @UploadedFiles() images?: Express.Multer.File[]
  ) {
    return await this.productService.createProduct(data, mainImage, images);
  }

  /**
   * 修改商品
   */
  @Put(':id')
  @UseInterceptors(
    FileInterceptor('mainImage'),
    FilesInterceptor('images', 10)
  )
  async updateProduct(
    @Param('id') id: string,
    @Body() data: any,
    @UploadedFile() mainImage?: Express.Multer.File,
    @UploadedFiles() images?: Express.Multer.File[]
  ) {
    const { deleteMainImage, deleteImageIndexes, ...productData } = data;
    return await this.productService.updateProduct(
      parseInt(id),
      productData,
      mainImage,
      images,
      deleteMainImage,
      deleteImageIndexes
    );
  }

  /**
   * 删除商品
   */
  @Delete(':id')
  async deleteProduct(@Param('id') id: string) {
    return await this.productService.deleteProduct(parseInt(id));
  }

  /**
   * 批量更新商品位置
   */
  @Post('position/batch')
  async updateProductPositions(@Body() positions: any[]) {
    return await this.productService.updateProductPositions(positions);
  }

  /**
   * 获取指定位置的商品列表
   */
  @Get('position/:position')
  async getProductsByPosition(@Param('position') position: string) {
    return await this.productService.getProductsByPosition(position);
  }
}

