import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';

/**
 * 收货地址服务
 * 每个用户只能访问自己的地址
 */
@Injectable()
export class AddressService {
  constructor(private prisma: PrismaService) {}

  /**
   * 获取地址列表
   */
  async getAddressList(customerId: number) {
    const addresses = await this.prisma.customerAddress.findMany({
      where: {
        customerId,
        delFlag: '0'
      },
      orderBy: [
        { isDefault: 'desc' },  // 默认地址排在前面
        { createTime: 'desc' }
      ]
    });

    return {
      list: addresses,
      total: addresses.length
    };
  }

  /**
   * 获取地址详情
   */
  async getAddressDetail(customerId: number, addressId: number) {
    const address = await this.prisma.customerAddress.findFirst({
      where: {
        addressId,
        customerId,
        delFlag: '0'
      }
    });

    if (!address) {
      throw new Error('地址不存在');
    }

    return address;
  }

  /**
   * 创建地址
   */
  async createAddress(customerId: number, data: any) {
    const { isDefault, ...addressData } = data;

    // 如果设置为默认地址，先取消其他默认地址
    if (isDefault === 1) {
      await this.prisma.customerAddress.updateMany({
        where: {
          customerId,
          delFlag: '0'
        },
        data: {
          isDefault: 0
        }
      });
    }

    return await this.prisma.customerAddress.create({
      data: {
        ...addressData,
        customerId,
        isDefault: isDefault || 0,
        delFlag: '0',
        createTime: new Date(),
        updateTime: new Date()
      }
    });
  }

  /**
   * 更新地址
   */
  async updateAddress(customerId: number, addressId: number, data: any) {
    // 验证地址是否属于当前用户
    const address = await this.prisma.customerAddress.findFirst({
      where: {
        addressId,
        customerId,
        delFlag: '0'
      }
    });

    if (!address) {
      throw new Error('地址不存在');
    }

    const { isDefault, ...addressData } = data;

    // 如果设置为默认地址，先取消其他默认地址
    if (isDefault === 1) {
      await this.prisma.customerAddress.updateMany({
        where: {
          customerId,
          addressId: { not: addressId },
          delFlag: '0'
        },
        data: {
          isDefault: 0
        }
      });
    }

    return await this.prisma.customerAddress.update({
      where: { addressId },
      data: {
        ...addressData,
        isDefault: isDefault !== undefined ? isDefault : address.isDefault,
        updateTime: new Date()
      }
    });
  }

  /**
   * 删除地址
   */
  async deleteAddress(customerId: number, addressId: number) {
    // 验证地址是否属于当前用户
    const address = await this.prisma.customerAddress.findFirst({
      where: {
        addressId,
        customerId,
        delFlag: '0'
      }
    });

    if (!address) {
      throw new Error('地址不存在');
    }

    // 软删除
    return await this.prisma.customerAddress.update({
      where: { addressId },
      data: {
        delFlag: '1',
        updateTime: new Date()
      }
    });
  }

  /**
   * 设置默认地址
   */
  async setDefaultAddress(customerId: number, addressId: number) {
    // 验证地址是否属于当前用户
    const address = await this.prisma.customerAddress.findFirst({
      where: {
        addressId,
        customerId,
        delFlag: '0'
      }
    });

    if (!address) {
      throw new Error('地址不存在');
    }

    // 取消其他默认地址
    await this.prisma.customerAddress.updateMany({
      where: {
        customerId,
        addressId: { not: addressId },
        delFlag: '0'
      },
      data: {
        isDefault: 0
      }
    });

    // 设置为默认地址
    return await this.prisma.customerAddress.update({
      where: { addressId },
      data: {
        isDefault: 1,
        updateTime: new Date()
      }
    });
  }

  /**
   * 获取默认地址
   */
  async getDefaultAddress(customerId: number) {
    const address = await this.prisma.customerAddress.findFirst({
      where: {
        customerId,
        isDefault: 1,
        delFlag: '0'
      }
    });

    return address;
  }
}

