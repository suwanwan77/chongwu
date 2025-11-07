/**
 * 前端API服务
 * 提供商品、购物车、心愿单、订单等API调用
 */

console.log('🔄 Loading api.js...');

const API = {
  // API基础URL
  baseURL: 'http://localhost:3000/api',

  /**
   * 通用请求方法
   * @param {string} url - 请求URL
   * @param {Object} options - 请求选项
   * @returns {Promise<Object>} 响应数据
   */
  async request(url, options = {}) {
    try {
      const token = AuthService?.getToken();
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers
      };

      if (token && options.auth !== false) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json();

      if (response.ok) {
        return data;
      } else {
        throw new Error(data.msg || data.message || 'Request failed');
      }
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  },

  // ========== 商品API ==========

  /**
   * 获取商品列表
   * @param {Object} params - 查询参数
   * @returns {Promise<Object>} 商品列表
   */
  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`${this.baseURL}/products?${queryString}`, {
      method: 'GET',
      auth: false
    });
  },

  /**
   * 获取商品详情
   * @param {number} productId - 商品ID
   * @returns {Promise<Object>} 商品详情
   */
  async getProductDetail(productId) {
    return await this.request(`${this.baseURL}/products/${productId}`, {
      method: 'GET',
      auth: false
    });
  },

  /**
   * 获取首页精选商品
   * @returns {Promise<Object>} 精选商品列表
   */
  async getFeaturedProducts() {
    return await this.request(`${this.baseURL}/products/featured/home`, {
      method: 'GET',
      auth: false
    });
  },

  /**
   * 获取相关商品
   * @param {number} productId - 商品ID
   * @returns {Promise<Object>} 相关商品列表
   */
  async getRelatedProducts(productId) {
    return await this.request(`${this.baseURL}/products/related/${productId}`, {
      method: 'GET',
      auth: false
    });
  },

  /**
   * 获取热销商品
   * @param {Object} params - 查询参数
   * @returns {Promise<Object>} 热销商品列表
   */
  async getHotProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`${this.baseURL}/products/hot/list?${queryString}`, {
      method: 'GET',
      auth: false
    });
  },

  /**
   * 获取新品列表
   * @param {Object} params - 查询参数
   * @returns {Promise<Object>} 新品列表
   */
  async getNewProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`${this.baseURL}/products/new/list?${queryString}`, {
      method: 'GET',
      auth: false
    });
  },

  /**
   * 搜索商品
   * @param {Object} params - 搜索参数
   * @returns {Promise<Object>} 搜索结果
   */
  async searchProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`${this.baseURL}/products/search?${queryString}`, {
      method: 'GET',
      auth: false
    });
  },

  // ========== 购物车API ==========

  /**
   * 获取购物车列表
   * @returns {Promise<Object>} 购物车列表
   */
  async getCart() {
    return await this.request(`${this.baseURL}/cart`, {
      method: 'GET'
    });
  },

  /**
   * 添加商品到购物车
   * @param {number} productId - 商品ID
   * @param {number} quantity - 数量
   * @returns {Promise<Object>} 添加结果
   */
  async addToCart(productId, quantity = 1) {
    return await this.request(`${this.baseURL}/cart`, {
      method: 'POST',
      body: JSON.stringify({ productId, quantity })
    });
  },

  /**
   * 更新购物车商品数量
   * @param {number} cartId - 购物车ID
   * @param {number} quantity - 新数量
   * @returns {Promise<Object>} 更新结果
   */
  async updateCartQuantity(cartId, quantity) {
    return await this.request(`${this.baseURL}/cart/${cartId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    });
  },

  /**
   * 从购物车删除商品
   * @param {number} cartId - 购物车ID
   * @returns {Promise<Object>} 删除结果
   */
  async removeFromCart(cartId) {
    return await this.request(`${this.baseURL}/cart/${cartId}`, {
      method: 'DELETE'
    });
  },

  /**
   * 清空购物车
   * @returns {Promise<Object>} 清空结果
   */
  async clearCart() {
    return await this.request(`${this.baseURL}/cart`, {
      method: 'DELETE'
    });
  },

  /**
   * 批量删除购物车商品
   * @param {Array<number>} cartIds - 购物车ID数组
   * @returns {Promise<Object>} 删除结果
   */
  async batchRemoveFromCart(cartIds) {
    return await this.request(`${this.baseURL}/cart/batch-remove`, {
      method: 'POST',
      body: JSON.stringify({ cartIds })
    });
  },

  // ========== 心愿单API ==========

  /**
   * 获取心愿单列表
   * @returns {Promise<Object>} 心愿单列表
   */
  async getWishlist() {
    return await this.request(`${this.baseURL}/wishlist`, {
      method: 'GET'
    });
  },

  /**
   * 添加商品到心愿单
   * @param {number} productId - 商品ID
   * @returns {Promise<Object>} 添加结果
   */
  async addToWishlist(productId) {
    return await this.request(`${this.baseURL}/wishlist`, {
      method: 'POST',
      body: JSON.stringify({ productId })
    });
  },

  /**
   * 从心愿单删除商品
   * @param {number} wishlistId - 心愿单ID
   * @returns {Promise<Object>} 删除结果
   */
  async removeFromWishlist(wishlistId) {
    return await this.request(`${this.baseURL}/wishlist/${wishlistId}`, {
      method: 'DELETE'
    });
  },

  /**
   * 清空心愿单
   * @returns {Promise<Object>} 清空结果
   */
  async clearWishlist() {
    return await this.request(`${this.baseURL}/wishlist`, {
      method: 'DELETE'
    });
  },

  /**
   * 检查商品是否在心愿单中
   * @param {number} productId - 商品ID
   * @returns {Promise<Object>} 检查结果
   */
  async checkWishlist(productId) {
    return await this.request(`${this.baseURL}/wishlist/check/${productId}`, {
      method: 'GET'
    });
  },

  /**
   * 批量添加到心愿单
   * @param {Array<number>} productIds - 商品ID数组
   * @returns {Promise<Object>} 添加结果
   */
  async batchAddToWishlist(productIds) {
    return await this.request(`${this.baseURL}/wishlist/batch`, {
      method: 'POST',
      body: JSON.stringify({ productIds })
    });
  },

  // ========== 收货地址API ==========

  /**
   * 获取收货地址列表
   * @returns {Promise<Object>} 地址列表
   */
  async getAddresses() {
    return await this.request(`${this.baseURL}/address`, {
      method: 'GET'
    });
  },

  /**
   * 获取地址详情
   * @param {number} addressId - 地址ID
   * @returns {Promise<Object>} 地址详情
   */
  async getAddressDetail(addressId) {
    return await this.request(`${this.baseURL}/address/${addressId}`, {
      method: 'GET'
    });
  },

  /**
   * 创建收货地址
   * @param {Object} addressData - 地址数据
   * @returns {Promise<Object>} 创建结果
   */
  async createAddress(addressData) {
    return await this.request(`${this.baseURL}/address`, {
      method: 'POST',
      body: JSON.stringify(addressData)
    });
  },

  /**
   * 更新收货地址
   * @param {number} addressId - 地址ID
   * @param {Object} addressData - 地址数据
   * @returns {Promise<Object>} 更新结果
   */
  async updateAddress(addressId, addressData) {
    return await this.request(`${this.baseURL}/address/${addressId}`, {
      method: 'PUT',
      body: JSON.stringify(addressData)
    });
  },

  /**
   * 删除收货地址
   * @param {number} addressId - 地址ID
   * @returns {Promise<Object>} 删除结果
   */
  async deleteAddress(addressId) {
    return await this.request(`${this.baseURL}/address/${addressId}`, {
      method: 'DELETE'
    });
  },

  /**
   * 设置默认地址
   * @param {number} addressId - 地址ID
   * @returns {Promise<Object>} 设置结果
   */
  async setDefaultAddress(addressId) {
    return await this.request(`${this.baseURL}/address/${addressId}/default`, {
      method: 'PUT'
    });
  },

  /**
   * 获取默认地址
   * @returns {Promise<Object>} 默认地址
   */
  async getDefaultAddress() {
    return await this.request(`${this.baseURL}/address/default/get`, {
      method: 'GET'
    });
  },

  // ========== 订单API ==========

  /**
   * 创建订单
   * @param {Object} orderData - 订单数据
   * @returns {Promise<Object>} 创建结果
   */
  async createOrder(orderData) {
    return await this.request(`${this.baseURL}/orders`, {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  },

  /**
   * 获取订单列表
   * @param {Object} params - 查询参数
   * @returns {Promise<Object>} 订单列表
   */
  async getOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`${this.baseURL}/orders?${queryString}`, {
      method: 'GET'
    });
  },

  /**
   * 获取订单详情
   * @param {number} orderId - 订单ID
   * @returns {Promise<Object>} 订单详情
   */
  async getOrderDetail(orderId) {
    return await this.request(`${this.baseURL}/orders/${orderId}`, {
      method: 'GET'
    });
  },

  /**
   * 取消订单
   * @param {number} orderId - 订单ID
   * @returns {Promise<Object>} 取消结果
   */
  async cancelOrder(orderId) {
    return await this.request(`${this.baseURL}/orders/${orderId}/cancel`, {
      method: 'PUT'
    });
  },

  /**
   * 确认收货
   * @param {number} orderId - 订单ID
   * @returns {Promise<Object>} 确认结果
   */
  async confirmOrder(orderId) {
    return await this.request(`${this.baseURL}/orders/${orderId}/confirm`, {
      method: 'PUT'
    });
  },

  // ========== 工具方法 ==========

  /**
   * 获取图片URL
   * @param {Object|string} imageJson - 图片JSON对象或字符串
   * @param {string} size - 图片尺寸
   * @returns {string} 图片URL
   */
  getImageUrl(imageJson, size = 'medium_600') {
    if (!imageJson) return '';
    try {
      const imageObj = typeof imageJson === 'string' ? JSON.parse(imageJson) : imageJson;
      const relativePath = imageObj[size] || imageObj.original || '';
      // 如果是相对路径，添加baseURL
      if (relativePath && !relativePath.startsWith('http')) {
        return `http://localhost:3000/${relativePath}`;
      }
      return relativePath;
    } catch (e) {
      console.error('Failed to parse image JSON:', e);
      return imageJson;
    }
  },

  /**
   * 格式化价格
   * @param {number} price - 价格
   * @returns {string} 格式化后的价格
   */
  formatPrice(price) {
    return `NZD $${parseFloat(price).toFixed(2)}`;
  }
};

// 导出到全局
window.API = API;

console.log('✅ API service loaded successfully!');

