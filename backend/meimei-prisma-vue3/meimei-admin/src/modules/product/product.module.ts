import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ImageProcessorService } from './image-processor.service';
import { FrontendProductController } from './frontend-product.controller';
import { FrontendProductService } from './frontend-product.service';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { WishlistController } from './wishlist.controller';
import { WishlistService } from './wishlist.service';
import { AddressController } from './address.controller';
import { AddressService } from './address.service';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [
    ProductController,
    FrontendProductController,
    CartController,
    WishlistController,
    AddressController,
    OrderController
  ],
  providers: [
    ProductService,
    ImageProcessorService,
    FrontendProductService,
    CartService,
    WishlistService,
    AddressService,
    OrderService
  ],
  exports: [
    ProductService,
    ImageProcessorService,
    FrontendProductService,
    CartService,
    WishlistService,
    AddressService,
    OrderService
  ]
})
export class ProductModule {}

