import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request
} from '@nestjs/common';
import { AddressService } from './address.service';
import { CustomerJwtAuthGuard } from '../frontend-auth/guards/customer-jwt-auth.guard';

/**
 * 收货地址Controller（需要客户认证）
 */
@Controller('api/address')
@UseGuards(CustomerJwtAuthGuard)
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  /**
   * 获取地址列表
   */
  @Get()
  async getAddressList(@Request() req: any) {
    const customerId = req.user.customerId;
    return await this.addressService.getAddressList(customerId);
  }

  /**
   * 获取地址详情
   */
  @Get(':addressId')
  async getAddressDetail(@Request() req: any, @Param('addressId') addressId: string) {
    const customerId = req.user.customerId;
    return await this.addressService.getAddressDetail(customerId, parseInt(addressId));
  }

  /**
   * 创建地址
   */
  @Post()
  async createAddress(@Request() req: any, @Body() body: any) {
    const customerId = req.user.customerId;
    return await this.addressService.createAddress(customerId, body);
  }

  /**
   * 更新地址
   */
  @Put(':addressId')
  async updateAddress(
    @Request() req: any,
    @Param('addressId') addressId: string,
    @Body() body: any
  ) {
    const customerId = req.user.customerId;
    return await this.addressService.updateAddress(customerId, parseInt(addressId), body);
  }

  /**
   * 删除地址
   */
  @Delete(':addressId')
  async deleteAddress(@Request() req: any, @Param('addressId') addressId: string) {
    const customerId = req.user.customerId;
    return await this.addressService.deleteAddress(customerId, parseInt(addressId));
  }

  /**
   * 设置默认地址
   */
  @Put(':addressId/default')
  async setDefaultAddress(@Request() req: any, @Param('addressId') addressId: string) {
    const customerId = req.user.customerId;
    return await this.addressService.setDefaultAddress(customerId, parseInt(addressId));
  }

  /**
   * 获取默认地址
   */
  @Get('default/get')
  async getDefaultAddress(@Request() req: any) {
    const customerId = req.user.customerId;
    return await this.addressService.getDefaultAddress(customerId);
  }
}

