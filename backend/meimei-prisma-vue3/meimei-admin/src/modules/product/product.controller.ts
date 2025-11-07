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
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

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
    const data = await this.productService.getProductList(query);
    return { code: 200, msg: '查询成功', data };
  }

  /**
   * 获取商品详情
   */
  @Get(':id')
  async getProductDetail(@Param('id') id: string) {
    const data = await this.productService.getProductDetail(parseInt(id));
    return { code: 200, msg: '查询成功', data };
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
    const result = await this.productService.createProduct(data, mainImage, images);
    return { code: 200, msg: '新增成功', data: result };
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
    const result = await this.productService.updateProduct(
      parseInt(id),
      productData,
      mainImage,
      images,
      deleteMainImage,
      deleteImageIndexes
    );
    return { code: 200, msg: '修改成功', data: result };
  }

  /**
   * 删除商品
   */
  @Delete(':id')
  async deleteProduct(@Param('id') id: string) {
    await this.productService.deleteProduct(parseInt(id));
    return { code: 200, msg: '删除成功' };
  }

  /**
   * 批量更新商品位置
   */
  @Post('position/batch')
  async updateProductPositions(@Body() positions: any[]) {
    await this.productService.updateProductPositions(positions);
    return { code: 200, msg: '更新成功' };
  }

  /**
   * 获取指定位置的商品列表
   */
  @Get('position/:position')
  async getProductsByPosition(@Param('position') position: string) {
    const data = await this.productService.getProductsByPosition(position);
    return { code: 200, msg: '查询成功', data };
  }
}

