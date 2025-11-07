import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

/**
 * 商品分类Controller（后台管理）
 */
@Controller('system/product/category')
@UseGuards(JwtAuthGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  /**
   * 获取分类列表
   */
  @Get('list')
  async getCategoryList(@Query() query: any) {
    const data = await this.categoryService.getCategoryList(query);
    return { code: 200, msg: '查询成功', data };
  }

  /**
   * 获取分类详情
   */
  @Get(':id')
  async getCategoryDetail(@Param('id') id: string) {
    const data = await this.categoryService.getCategoryDetail(parseInt(id));
    return { code: 200, msg: '查询成功', data };
  }

  /**
   * 创建分类
   */
  @Post()
  async createCategory(@Body() body: any) {
    const data = await this.categoryService.createCategory(body);
    return { code: 200, msg: '新增成功', data };
  }

  /**
   * 更新分类
   */
  @Put()
  async updateCategory(@Body() body: any) {
    const { categoryId, ...data } = body;
    const result = await this.categoryService.updateCategory(categoryId, data);
    return { code: 200, msg: '修改成功', data: result };
  }

  /**
   * 删除分类
   */
  @Delete(':id')
  async deleteCategory(@Param('id') id: string) {
    await this.categoryService.deleteCategory(parseInt(id));
    return { code: 200, msg: '删除成功' };
  }
}

