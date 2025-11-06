import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ImageProcessorService } from './image-processor.service';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [ProductController],
  providers: [ProductService, ImageProcessorService],
  exports: [ProductService, ImageProcessorService]
})
export class ProductModule {}

