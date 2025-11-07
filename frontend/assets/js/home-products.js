/**
 * 首页精选商品动态加载
 */

console.log('🔄 Loading home-products.js...');

(function() {
  'use strict';

  // 等待DOM加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  async function init() {
    console.log('home-products.js: Initializing...');

    // 检查API是否存在
    if (typeof API === 'undefined') {
      console.warn('API service not loaded, cannot load featured products');
      return;
    }

    // 加载精选商品
    await loadFeaturedProducts();
  }

  /**
   * 加载精选商品
   */
  async function loadFeaturedProducts() {
    try {
      console.log('📦 Loading featured products...');
      
      const result = await API.getFeaturedProducts();
      
      if (result.code === 200 && result.data && result.data.length > 0) {
        console.log('✅ Featured products loaded:', result.data.length);
        renderFeaturedProducts(result.data);
      } else {
        console.warn('⚠️ No featured products found');
      }
    } catch (error) {
      console.error('❌ Failed to load featured products:', error);
    }
  }

  /**
   * 渲染精选商品
   * @param {Array} products - 商品列表
   */
  function renderFeaturedProducts(products) {
    // 查找商品列表容器
    const productList = document.querySelector('.products.columns-1');
    
    if (!productList) {
      console.warn('Product list container not found');
      return;
    }

    // 清空现有商品
    productList.innerHTML = '';

    // 渲染每个商品
    products.forEach((product, index) => {
      const productHtml = createProductHTML(product, index === 0);
      productList.insertAdjacentHTML('beforeend', productHtml);
    });

    // 重新初始化轮播（如果需要）
    initCarousel();

    console.log('✅ Featured products rendered');
  }

  /**
   * 创建商品HTML
   * @param {Object} product - 商品数据
   * @param {boolean} isFirst - 是否是第一个商品
   * @returns {string} HTML字符串
   */
  function createProductHTML(product, isFirst = false) {
    const {
      productId,
      productName,
      productCode,
      price,
      originalPrice,
      mainImage,
      stock,
      status
    } = product;

    // 获取图片URL
    const imageUrl = API.getImageUrl(mainImage, 'large_800');
    const imageSrcset = `
      ${API.getImageUrl(mainImage, 'large_800')} 800w,
      ${API.getImageUrl(mainImage, 'small_274')} 274w,
      ${API.getImageUrl(mainImage, 'large_768')} 768w
    `;
    const thumbnailUrl = API.getImageUrl(mainImage, 'thumbnail_150');

    // 计算折扣
    const hasDiscount = originalPrice && parseFloat(originalPrice) > parseFloat(price);
    const discountPercent = hasDiscount 
      ? Math.round((1 - parseFloat(price) / parseFloat(originalPrice)) * 100)
      : 0;

    // 商品链接
    const productLink = `shop/product-${productId}/index.html`;

    // 库存状态
    const stockClass = stock > 0 ? 'instock' : 'outofstock';
    const firstClass = isFirst ? 'first' : '';

    return `
<li class="product type-product post-${productId} status-publish ${firstClass} ${stockClass} has-post-thumbnail ${hasDiscount ? 'sale' : ''} shipping-taxable purchasable product-type-simple">
  <div class="product-block">
    <div class="product-transition">
      ${hasDiscount ? `<span class="onsale">-${discountPercent}%</span>` : ''}
      <div class="product-image">
        <img loading="lazy" decoding="async" width="800" height="877" 
          src="${imageUrl}" 
          class="attachment-shop_catalog size-shop_catalog" 
          alt="${productName}" 
          srcset="${imageSrcset}" 
          sizes="(max-width: 800px) 100vw, 800px">
      </div>
      <div class="group-action">
        <div class="shop-action">
          <button class="woosq-btn woosq-btn-${productId}" data-id="${productId}" data-effect="mfp-3d-unfold" data-context="default">Quick view</button>
          <button class="woosw-btn woosw-btn-${productId}" data-id="${productId}" data-product_name="${productName}" data-product_image="${thumbnailUrl}" aria-label="Add to wishlist" onclick="handleAddToWishlist(${productId})">Add to wishlist</button>
          <button class="woosc-btn woosc-btn-${productId}" data-text="Compare" data-text_added="Compare" data-id="${productId}" data-product_id="${productId}" data-product_name="${productName}" data-product_image="${thumbnailUrl}">Compare</button>
        </div>
      </div>
      <a href="${productLink}" class="woocommerce-LoopProduct-link woocommerce-loop-product__link"></a>
    </div>
    <div class="product-caption">
      <h3 class="woocommerce-loop-product__title">
        <a href="${productLink}">${productName}</a>
      </h3>
      <div class="product-caption-content">
        ${createPriceHTML(price, originalPrice, hasDiscount)}
      </div>
      ${stock > 0 ? createAddToCartButton(productId, productName) : '<span class="out-of-stock">Out of stock</span>'}
    </div>
  </div>
</li>
    `.trim();
  }

  /**
   * 创建价格HTML
   * @param {number} price - 当前价格
   * @param {number} originalPrice - 原价
   * @param {boolean} hasDiscount - 是否有折扣
   * @returns {string} HTML字符串
   */
  function createPriceHTML(price, originalPrice, hasDiscount) {
    const formattedPrice = `<span class="woocommerce-Price-amount amount"><bdi><span class="woocommerce-Price-currencySymbol">&#36;</span>${parseFloat(price).toFixed(2)}</bdi></span>`;
    
    if (hasDiscount) {
      const formattedOriginalPrice = `<span class="woocommerce-Price-amount amount"><bdi><span class="woocommerce-Price-currencySymbol">&#36;</span>${parseFloat(originalPrice).toFixed(2)}</bdi></span>`;
      return `
<span class="price">
  <del aria-hidden="true">${formattedOriginalPrice}</del>
  <span class="screen-reader-text">Original price was: &#036;${parseFloat(originalPrice).toFixed(2)}.</span>
  <ins aria-hidden="true">${formattedPrice}</ins>
  <span class="screen-reader-text">Current price is: &#036;${parseFloat(price).toFixed(2)}.</span>
</span>
      `.trim();
    } else {
      return `<span class="price">${formattedPrice}</span>`;
    }
  }

  /**
   * 创建添加到购物车按钮
   * @param {number} productId - 商品ID
   * @param {string} productName - 商品名称
   * @returns {string} HTML字符串
   */
  function createAddToCartButton(productId, productName) {
    return `
<a href="#" 
  aria-describedby="woocommerce_loop_add_to_cart_link_describedby_${productId}" 
  data-quantity="1" 
  class="button product_type_simple add_to_cart_button ajax_add_to_cart" 
  data-product_id="${productId}" 
  aria-label="Add to cart: &ldquo;${productName}&rdquo;" 
  rel="nofollow" 
  data-success_message="&ldquo;${productName}&rdquo; has been added to your cart"
  onclick="handleAddToCart(event, ${productId})">
  Add to cart
</a>
<span id="woocommerce_loop_add_to_cart_link_describedby_${productId}" class="screen-reader-text"></span>
    `.trim();
  }

  /**
   * 初始化轮播
   */
  function initCarousel() {
    // 如果页面有轮播初始化函数，调用它
    if (typeof jQuery !== 'undefined' && jQuery.fn.owlCarousel) {
      const carousel = jQuery('.woocommerce-carousel');
      if (carousel.length > 0) {
        // 销毁旧的轮播实例
        carousel.trigger('destroy.owl.carousel');
        carousel.removeClass('owl-loaded owl-drag');
        
        // 重新初始化
        const settings = carousel.data('settings');
        if (settings) {
          carousel.owlCarousel(settings);
        }
      }
    }
  }

  // 导出到全局（如果需要）
  window.HomeFeaturedProducts = {
    reload: loadFeaturedProducts
  };
})();

/**
 * 处理添加到购物车
 * @param {Event} event - 点击事件
 * @param {number} productId - 商品ID
 */
async function handleAddToCart(event, productId) {
  event.preventDefault();
  
  // 检查是否登录
  if (!AuthService || !AuthService.isLoggedIn()) {
    alert('Please login first');
    window.location.href = '/my-account/index.html';
    return;
  }

  try {
    const button = event.target;
    const originalText = button.textContent;
    button.textContent = 'Adding...';
    button.disabled = true;

    const result = await API.addToCart(productId, 1);
    
    if (result.code === 200) {
      button.textContent = '✓ Added';
      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
      }, 2000);
      
      // 更新购物车数量（如果有购物车图标）
      updateCartCount();
    } else {
      throw new Error(result.msg || 'Failed to add to cart');
    }
  } catch (error) {
    console.error('Add to cart error:', error);
    alert(error.message || 'Failed to add to cart');
    event.target.textContent = 'Add to cart';
    event.target.disabled = false;
  }
}

/**
 * 处理添加到心愿单
 * @param {number} productId - 商品ID
 */
async function handleAddToWishlist(productId) {
  // 检查是否登录
  if (!AuthService || !AuthService.isLoggedIn()) {
    alert('Please login first');
    window.location.href = '/my-account/index.html';
    return;
  }

  try {
    const result = await API.addToWishlist(productId);
    
    if (result.code === 200) {
      alert('Added to wishlist successfully!');
    } else {
      throw new Error(result.msg || 'Failed to add to wishlist');
    }
  } catch (error) {
    console.error('Add to wishlist error:', error);
    alert(error.message || 'Failed to add to wishlist');
  }
}

/**
 * 更新购物车数量
 */
async function updateCartCount() {
  try {
    const result = await API.getCart();
    if (result.code === 200 && result.data) {
      const count = result.data.items ? result.data.items.length : 0;
      
      // 更新购物车图标数量（如果有）
      const cartCountElements = document.querySelectorAll('.cart-count, .mini-cart-count');
      cartCountElements.forEach(el => {
        el.textContent = count;
      });
    }
  } catch (error) {
    console.error('Failed to update cart count:', error);
  }
}

console.log('✅ home-products.js loaded successfully!');

