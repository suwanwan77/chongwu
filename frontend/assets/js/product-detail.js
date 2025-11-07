/**
 * 商品详情页动态加载
 * 功能：
 * 1. 从URL获取商品ID
 * 2. 从API加载商品详情
 * 3. 动态渲染商品信息（名称、价格、图片、描述、规格）
 * 4. 实现图片画廊切换
 * 5. 实现数量选择器
 * 6. 实现"Add to Cart"按钮
 * 7. 加载并渲染相关商品
 */

console.log('🔄 Loading product-detail.js...');

const ProductDetail = {
  productId: null,
  currentProduct: null,
  currentQuantity: 1,

  /**
   * 初始化
   */
  async init() {
    console.log('📦 Initializing product detail page...');
    
    // 从URL获取商品ID
    this.productId = this.getProductIdFromURL();
    
    if (!this.productId) {
      console.error('❌ No product ID found in URL');
      this.showError('Product not found');
      return;
    }

    console.log(`📦 Product ID: ${this.productId}`);

    // 加载商品详情
    await this.loadProductDetail();

    // 加载相关商品
    await this.loadRelatedProducts();

    // 绑定事件
    this.bindEvents();

    console.log('✅ Product detail page initialized');
  },

  /**
   * 从URL获取商品ID
   * URL格式: /shop/product-slug/index.html 或 /shop/product-slug/
   * 需要通过slug查询商品ID，或者使用URL参数 ?id=123
   */
  getProductIdFromURL() {
    // 方法1: 从URL参数获取
    const urlParams = new URLSearchParams(window.location.search);
    const idFromParam = urlParams.get('id');
    if (idFromParam) {
      return parseInt(idFromParam);
    }

    // 方法2: 从页面中的隐藏元素获取（如果有的话）
    const productElement = document.querySelector('[data-product-id]');
    if (productElement) {
      return parseInt(productElement.getAttribute('data-product-id'));
    }

    // 方法3: 从现有的WooCommerce数据获取
    const addToCartButton = document.querySelector('.single_add_to_cart_button[value]');
    if (addToCartButton) {
      return parseInt(addToCartButton.getAttribute('value'));
    }

    return null;
  },

  /**
   * 加载商品详情
   */
  async loadProductDetail() {
    try {
      console.log(`📦 Loading product detail for ID: ${this.productId}...`);
      
      const response = await API.getProductDetail(this.productId);
      
      if (response.code === 200 && response.data) {
        this.currentProduct = response.data;
        console.log('✅ Product detail loaded:', this.currentProduct);
        
        // 渲染商品详情
        this.renderProductDetail();
      } else {
        throw new Error(response.msg || 'Failed to load product');
      }
    } catch (error) {
      console.error('❌ Error loading product detail:', error);
      this.showError('Failed to load product details');
    }
  },

  /**
   * 渲染商品详情
   */
  renderProductDetail() {
    const product = this.currentProduct;
    
    // 更新页面标题
    document.title = `${product.productName} - Pawganic`;
    
    // 更新商品名称
    const titleElement = document.querySelector('.product_title');
    if (titleElement) {
      titleElement.textContent = product.productName;
    }

    // 更新商品价格
    this.renderPrice(product);

    // 更新商品图片
    this.renderImages(product);

    // 更新商品描述
    this.renderDescription(product);

    // 更新商品规格
    this.renderSpecifications(product);

    // 更新SKU
    const skuElement = document.querySelector('.sku');
    if (skuElement) {
      skuElement.textContent = product.sku || 'N/A';
    }

    // 更新库存状态
    this.renderStockStatus(product);

    console.log('✅ Product detail rendered');
  },

  /**
   * 渲染价格
   */
  renderPrice(product) {
    const priceContainer = document.querySelector('.summary .price');
    if (!priceContainer) return;

    let priceHTML = '';

    if (product.salePrice && product.salePrice < product.price) {
      // 有促销价
      priceHTML = `
        <del aria-hidden="true">
          <span class="woocommerce-Price-amount amount">
            <bdi><span class="woocommerce-Price-currencySymbol">$</span>${product.price.toFixed(2)}</bdi>
          </span>
        </del>
        <span class="screen-reader-text">Original price was: $${product.price.toFixed(2)}.</span>
        <ins aria-hidden="true">
          <span class="woocommerce-Price-amount amount">
            <bdi><span class="woocommerce-Price-currencySymbol">$</span>${product.salePrice.toFixed(2)}</bdi>
          </span>
        </ins>
        <span class="screen-reader-text">Current price is: $${product.salePrice.toFixed(2)}.</span>
      `;
    } else {
      // 无促销价
      priceHTML = `
        <span class="woocommerce-Price-amount amount">
          <bdi><span class="woocommerce-Price-currencySymbol">$</span>${product.price.toFixed(2)}</bdi>
        </span>
      `;
    }

    priceContainer.innerHTML = priceHTML;
  },

  /**
   * 渲染图片
   */
  renderImages(product) {
    const galleryWrapper = document.querySelector('.woocommerce-product-gallery__wrapper');
    if (!galleryWrapper) return;

    // 解析主图和多图
    const mainImage = typeof product.mainImage === 'string' ? JSON.parse(product.mainImage) : product.mainImage;
    const images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;

    // 合并所有图片（主图 + 多图）
    const allImages = [mainImage, ...(images || [])];

    // 生成图片HTML
    let imagesHTML = '';
    allImages.forEach((img, index) => {
      if (!img) return;

      const large800 = img.large_800 || img.original;
      const large768 = img.large_768 || img.original;
      const small274 = img.small_274 || img.original;
      const thumbnail100 = img.thumbnail_100 || img.original;

      const isFirst = index === 0;

      imagesHTML += `
        <div data-thumb="${API.baseURL.replace('/api', '')}/${thumbnail100}" 
             data-thumb-alt="${product.productName} - Image ${index + 1}" 
             data-thumb-srcset="${API.baseURL.replace('/api', '')}/${large800} 800w, ${API.baseURL.replace('/api', '')}/${small274} 274w, ${API.baseURL.replace('/api', '')}/${large768} 768w" 
             data-thumb-sizes="(max-width: 109px) 100vw, 109px" 
             class="woocommerce-product-gallery__image">
          <a href="${API.baseURL.replace('/api', '')}/${large800}">
            <img width="800" height="877" 
                 src="${API.baseURL.replace('/api', '')}/${large800}" 
                 class="${isFirst ? 'wp-post-image' : ''}" 
                 alt="${product.productName} - Image ${index + 1}" 
                 data-caption="" 
                 data-src="${API.baseURL.replace('/api', '')}/${large800}" 
                 data-large_image="${API.baseURL.replace('/api', '')}/${large800}" 
                 data-large_image_width="800" 
                 data-large_image_height="877" 
                 decoding="async" 
                 srcset="${API.baseURL.replace('/api', '')}/${large800} 800w, ${API.baseURL.replace('/api', '')}/${small274} 274w, ${API.baseURL.replace('/api', '')}/${large768} 768w" 
                 sizes="(max-width: 800px) 100vw, 800px">
          </a>
        </div>
      `;
    });

    galleryWrapper.innerHTML = imagesHTML;

    // 重新初始化WooCommerce图片画廊（如果有的话）
    if (typeof jQuery !== 'undefined' && jQuery.fn.wc_product_gallery) {
      jQuery('.woocommerce-product-gallery').wc_product_gallery();
    }
  },

  /**
   * 渲染描述
   */
  renderDescription(product) {
    const descriptionTab = document.querySelector('#tab-description');
    if (descriptionTab && product.description) {
      descriptionTab.innerHTML = `<p>${product.description}</p>`;
    }
  },

  /**
   * 渲染规格
   */
  renderSpecifications(product) {
    if (!product.specifications) return;

    const specsTab = document.querySelector('#tab-additional_information');
    if (!specsTab) return;

    const specs = typeof product.specifications === 'string' ? JSON.parse(product.specifications) : product.specifications;

    let specsHTML = '<table class="woocommerce-product-attributes shop_attributes">';
    for (const [key, value] of Object.entries(specs)) {
      specsHTML += `
        <tr>
          <th>${key}</th>
          <td>${value}</td>
        </tr>
      `;
    }
    specsHTML += '</table>';

    specsTab.innerHTML = specsHTML;
  },

  /**
   * 渲染库存状态
   */
  renderStockStatus(product) {
    const stockElement = document.querySelector('.stock');
    if (!stockElement) return;

    if (product.stock > 0) {
      stockElement.textContent = `${product.stock} in stock`;
      stockElement.className = 'stock in-stock';
    } else {
      stockElement.textContent = 'Out of stock';
      stockElement.className = 'stock out-of-stock';
    }
  },

  /**
   * 加载相关商品
   */
  async loadRelatedProducts() {
    try {
      console.log(`📦 Loading related products for ID: ${this.productId}...`);
      
      const response = await API.getRelatedProducts(this.productId);
      
      if (response.code === 200 && response.data && response.data.length > 0) {
        console.log(`✅ Related products loaded: ${response.data.length}`);
        this.renderRelatedProducts(response.data);
      } else {
        console.log('ℹ️ No related products found');
      }
    } catch (error) {
      console.error('❌ Error loading related products:', error);
    }
  },

  /**
   * 渲染相关商品
   */
  renderRelatedProducts(products) {
    const relatedProductsContainer = document.querySelector('.related.products ul.products');
    if (!relatedProductsContainer) return;

    let productsHTML = '';

    products.forEach((product, index) => {
      const mainImage = typeof product.mainImage === 'string' ? JSON.parse(product.mainImage) : product.mainImage;
      const imgSrc = mainImage ? `${API.baseURL.replace('/api', '')}/${mainImage.large_800 || mainImage.original}` : '';
      const imgSrcset = mainImage ? `${API.baseURL.replace('/api', '')}/${mainImage.large_800 || mainImage.original} 800w, ${API.baseURL.replace('/api', '')}/${mainImage.small_274 || mainImage.original} 274w, ${API.baseURL.replace('/api', '')}/${mainImage.large_768 || mainImage.original} 768w` : '';

      const currentPrice = product.salePrice && product.salePrice < product.price ? product.salePrice : product.price;
      const hasDiscount = product.salePrice && product.salePrice < product.price;

      const priceHTML = hasDiscount ? `
        <del aria-hidden="true"><span class="woocommerce-Price-amount amount"><bdi><span class="woocommerce-Price-currencySymbol">$</span>${product.price.toFixed(2)}</bdi></span></del>
        <ins aria-hidden="true"><span class="woocommerce-Price-amount amount"><bdi><span class="woocommerce-Price-currencySymbol">$</span>${product.salePrice.toFixed(2)}</bdi></span></ins>
      ` : `
        <span class="woocommerce-Price-amount amount"><bdi><span class="woocommerce-Price-currencySymbol">$</span>${product.price.toFixed(2)}</bdi></span>
      `;

      productsHTML += `
        <li class="product type-product ${index === 0 ? 'first' : ''} ${index === products.length - 1 ? 'last' : ''} instock">
          <div class="product-block">
            <div class="product-transition">
              ${hasDiscount ? '<span class="onsale">Sale</span>' : ''}
              <div class="product-image">
                <img width="800" height="877" src="${imgSrc}" class="attachment-shop_catalog size-shop_catalog" alt="${product.productName}" decoding="async" srcset="${imgSrcset}" sizes="(max-width: 800px) 100vw, 800px">
              </div>
              <div class="group-action">
                <div class="shop-action">
                  <button class="woosw-btn" data-product-id="${product.productId}" aria-label="Add to wishlist">Add to wishlist</button>
                </div>
              </div>
              <a href="?id=${product.productId}" class="woocommerce-LoopProduct-link woocommerce-loop-product__link"></a>
            </div>
            <div class="product-caption">
              <h3 class="woocommerce-loop-product__title"><a href="?id=${product.productId}">${product.productName}</a></h3>
              <div class="product-caption-content">
                <span class="price">${priceHTML}</span>
              </div>
              <button class="button product_type_simple add_to_cart_button" data-product-id="${product.productId}" data-quantity="1">Add to cart</button>
            </div>
          </div>
        </li>
      `;
    });

    relatedProductsContainer.innerHTML = productsHTML;

    console.log('✅ Related products rendered');
  },

  /**
   * 绑定事件
   */
  bindEvents() {
    // Add to Cart按钮
    const addToCartButton = document.querySelector('.single_add_to_cart_button[type="submit"]');
    if (addToCartButton) {
      addToCartButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleAddToCart();
      });
    }

    // 数量选择器
    const quantityInput = document.querySelector('.quantity input[type="number"]');
    if (quantityInput) {
      quantityInput.addEventListener('change', (e) => {
        this.currentQuantity = parseInt(e.target.value) || 1;
      });
    }

    // 相关商品的Add to Cart按钮
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('add_to_cart_button')) {
        e.preventDefault();
        const productId = parseInt(e.target.getAttribute('data-product-id'));
        const quantity = parseInt(e.target.getAttribute('data-quantity')) || 1;
        this.handleAddToCartRelated(productId, quantity, e.target);
      }
    });

    console.log('✅ Events bound');
  },

  /**
   * 处理Add to Cart
   */
  async handleAddToCart() {
    if (!AuthService || !AuthService.isLoggedIn()) {
      alert('Please login to add items to cart');
      window.location.href = '/login/';
      return;
    }

    try {
      console.log(`🛒 Adding product ${this.productId} to cart (quantity: ${this.currentQuantity})...`);

      const response = await API.addToCart({
        productId: this.productId,
        quantity: this.currentQuantity
      });

      if (response.code === 200) {
        console.log('✅ Product added to cart');
        alert('Product added to cart successfully!');
        
        // 更新购物车徽章
        if (typeof UserNav !== 'undefined' && UserNav.updateCartBadge) {
          UserNav.updateCartBadge();
        }
      } else {
        throw new Error(response.msg || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      alert('Failed to add product to cart: ' + error.message);
    }
  },

  /**
   * 处理相关商品Add to Cart
   */
  async handleAddToCartRelated(productId, quantity, button) {
    if (!AuthService || !AuthService.isLoggedIn()) {
      alert('Please login to add items to cart');
      window.location.href = '/login/';
      return;
    }

    try {
      console.log(`🛒 Adding related product ${productId} to cart (quantity: ${quantity})...`);

      const originalText = button.textContent;
      button.textContent = 'Adding...';
      button.disabled = true;

      const response = await API.addToCart({
        productId: productId,
        quantity: quantity
      });

      if (response.code === 200) {
        console.log('✅ Related product added to cart');
        button.textContent = 'Added!';
        
        // 更新购物车徽章
        if (typeof UserNav !== 'undefined' && UserNav.updateCartBadge) {
          UserNav.updateCartBadge();
        }

        setTimeout(() => {
          button.textContent = originalText;
          button.disabled = false;
        }, 2000);
      } else {
        throw new Error(response.msg || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('❌ Error adding related product to cart:', error);
      alert('Failed to add product to cart: ' + error.message);
      button.textContent = 'Add to cart';
      button.disabled = false;
    }
  },

  /**
   * 显示错误
   */
  showError(message) {
    const contentWrapper = document.querySelector('.content-single-wrapper');
    if (contentWrapper) {
      contentWrapper.innerHTML = `
        <div class="woocommerce-error" role="alert">
          <strong>Error:</strong> ${message}
        </div>
      `;
    }
  }
};

// 页面加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    ProductDetail.init();
  });
} else {
  ProductDetail.init();
}

console.log('✅ product-detail.js loaded successfully!');

