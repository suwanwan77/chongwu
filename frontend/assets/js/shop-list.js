/**
 * Shop List Page Dynamic Loading
 * Handles product list display, filtering, sorting, and pagination
 */

const ShopList = {
  products: [],
  currentPage: 1,
  pageSize: 12,
  totalProducts: 0,
  currentSort: 'default',
  currentFilters: {},
  
  /**
   * Initialize shop list page
   */
  async init() {
    console.log('📦 Initializing shop list page...');
    
    // Check if we're on the shop page
    if (!document.body.classList.contains('woocommerce-shop') && 
        !document.body.classList.contains('post-type-archive-product')) {
      console.log('⚠️ Not on shop page, skipping initialization');
      return;
    }
    
    try {
      await this.loadProducts();
      this.bindEvents();
      console.log('✅ Shop list page initialized');
    } catch (error) {
      console.error('❌ Failed to initialize shop list page:', error);
      this.showError('Failed to load products. Please refresh the page.');
    }
  },
  
  /**
   * Load products from API
   */
  async loadProducts() {
    console.log(`📦 Loading products (page ${this.currentPage})...`);
    
    try {
      const params = {
        displayPosition: 'shop_list',
        page: this.currentPage,
        pageSize: this.pageSize,
        ...this.currentFilters
      };
      
      // Add sorting
      if (this.currentSort !== 'default') {
        const [sortBy, order] = this.currentSort.split('-');
        params.sortBy = sortBy;
        params.order = order;
      }
      
      const response = await API.getProducts(params);
      
      if (response.code === 200) {
        this.products = response.data.rows || [];
        this.totalProducts = response.data.total || 0;
        console.log(`✅ Products loaded: ${this.products.length} items`);
        
        this.renderProducts();
        this.renderPagination();
      } else {
        throw new Error(response.msg || 'Failed to load products');
      }
    } catch (error) {
      console.error('❌ Failed to load products:', error);
      throw error;
    }
  },
  
  /**
   * Render products grid
   */
  renderProducts() {
    console.log('📦 Rendering products...');
    
    const container = document.querySelector('.products.columns-4') || 
                     document.querySelector('.products') ||
                     document.querySelector('ul.products');
    
    if (!container) {
      console.error('❌ Products container not found');
      return;
    }
    
    if (this.products.length === 0) {
      container.innerHTML = `
        <li class="no-products-found">
          <p>No products were found matching your selection.</p>
        </li>
      `;
      return;
    }
    
    container.innerHTML = this.products.map(product => this.renderProductCard(product)).join('');
    
    // Bind add to cart and wishlist events
    this.bindProductEvents();
  },
  
  /**
   * Render single product card
   */
  renderProductCard(product) {
    const price = product.salePrice || product.price;
    const hasDiscount = product.salePrice && product.salePrice < product.price;
    
    // Parse main image
    let mainImage = product.mainImage;
    if (typeof mainImage === 'string') {
      try {
        mainImage = JSON.parse(mainImage);
      } catch (e) {
        console.error('Failed to parse mainImage:', e);
      }
    }
    
    // Get image URLs
    const imageUrl = mainImage?.small_274 || mainImage?.thumbnail_100 || mainImage?.original || '';
    const imageUrlWebp = mainImage?.['small_274.webp'] || '';
    
    // Build badges
    let badges = '';
    if (product.isNew === '1') {
      badges += '<span class="onsale new">New</span>';
    }
    if (hasDiscount) {
      const discountPercent = Math.round((1 - product.salePrice / product.price) * 100);
      badges += `<span class="onsale">-${discountPercent}%</span>`;
    }
    if (product.stock <= 0) {
      badges += '<span class="out-of-stock">Out of stock</span>';
    }
    
    return `
      <li class="product type-product status-publish has-post-thumbnail" data-product-id="${product.productId}">
        <div class="product-inner">
          <div class="product-thumbnail">
            ${badges}
            <a href="../shop/product-${product.productId}/index.html">
              <picture>
                ${imageUrlWebp ? `<source srcset="${imageUrlWebp}" type="image/webp">` : ''}
                <img src="${imageUrl}" 
                     class="attachment-woocommerce_thumbnail" 
                     alt="${product.productName}"
                     loading="lazy">
              </picture>
            </a>
            <div class="product-actions">
              <button class="button product_type_simple add_to_cart_button ajax_add_to_cart" 
                      data-product-id="${product.productId}"
                      ${product.stock <= 0 ? 'disabled' : ''}>
                Add to cart
              </button>
              <button class="button add-to-wishlist" 
                      data-product-id="${product.productId}"
                      title="Add to wishlist">
                <i class="woosw-icon-5"></i>
              </button>
            </div>
          </div>
          <div class="product-info">
            <h2 class="woocommerce-loop-product__title">
              <a href="../shop/product-${product.productId}/index.html">${product.productName}</a>
            </h2>
            <span class="price">
              ${hasDiscount ? `
                <del><span class="woocommerce-Price-amount amount">
                  <bdi><span class="woocommerce-Price-currencySymbol">$</span>${product.price.toFixed(2)}</bdi>
                </span></del>
              ` : ''}
              <ins><span class="woocommerce-Price-amount amount">
                <bdi><span class="woocommerce-Price-currencySymbol">$</span>${price.toFixed(2)}</bdi>
              </span></ins>
            </span>
          </div>
        </div>
      </li>
    `;
  },
  
  /**
   * Render pagination
   */
  renderPagination() {
    const totalPages = Math.ceil(this.totalProducts / this.pageSize);
    
    if (totalPages <= 1) return;
    
    const paginationContainer = document.querySelector('.woocommerce-pagination');
    if (!paginationContainer) return;
    
    let paginationHTML = '<ul class="page-numbers">';
    
    // Previous button
    if (this.currentPage > 1) {
      paginationHTML += `<li><a class="prev page-numbers" href="#" data-page="${this.currentPage - 1}">←</a></li>`;
    }
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      if (i === this.currentPage) {
        paginationHTML += `<li><span aria-current="page" class="page-numbers current">${i}</span></li>`;
      } else if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
        paginationHTML += `<li><a class="page-numbers" href="#" data-page="${i}">${i}</a></li>`;
      } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
        paginationHTML += `<li><span class="page-numbers dots">…</span></li>`;
      }
    }
    
    // Next button
    if (this.currentPage < totalPages) {
      paginationHTML += `<li><a class="next page-numbers" href="#" data-page="${this.currentPage + 1}">→</a></li>`;
    }
    
    paginationHTML += '</ul>';
    paginationContainer.innerHTML = paginationHTML;
    
    // Bind pagination events
    this.bindPaginationEvents();
  },
  
  /**
   * Bind events
   */
  bindEvents() {
    // Bind sorting dropdown
    const sortingSelect = document.querySelector('.woocommerce-ordering select');
    if (sortingSelect) {
      sortingSelect.addEventListener('change', (e) => this.handleSortChange(e));
    }
  },
  
  /**
   * Bind product events (add to cart, add to wishlist)
   */
  bindProductEvents() {
    // Bind add to cart buttons
    const addToCartButtons = document.querySelectorAll('.add_to_cart_button');
    addToCartButtons.forEach(button => {
      button.addEventListener('click', (e) => this.handleAddToCart(e));
    });
    
    // Bind add to wishlist buttons
    const wishlistButtons = document.querySelectorAll('.add-to-wishlist');
    wishlistButtons.forEach(button => {
      button.addEventListener('click', (e) => this.handleAddToWishlist(e));
    });
  },
  
  /**
   * Bind pagination events
   */
  bindPaginationEvents() {
    const pageLinks = document.querySelectorAll('.woocommerce-pagination .page-numbers');
    pageLinks.forEach(link => {
      link.addEventListener('click', (e) => this.handlePageChange(e));
    });
  },
  
  /**
   * Handle sort change
   */
  async handleSortChange(event) {
    this.currentSort = event.target.value;
    this.currentPage = 1; // Reset to first page
    console.log(`📦 Sorting changed to: ${this.currentSort}`);
    await this.loadProducts();
  },
  
  /**
   * Handle page change
   */
  async handlePageChange(event) {
    event.preventDefault();
    
    const link = event.currentTarget;
    const page = parseInt(link.getAttribute('data-page'));
    
    if (page && page !== this.currentPage) {
      this.currentPage = page;
      console.log(`📦 Page changed to: ${this.currentPage}`);
      await this.loadProducts();
      
      // Scroll to top of products
      const productsContainer = document.querySelector('.products');
      if (productsContainer) {
        productsContainer.scrollIntoView({ behavior: 'smooth' });
      }
    }
  },
  
  /**
   * Handle add to cart
   */
  async handleAddToCart(event) {
    event.preventDefault();
    
    const button = event.currentTarget;
    const productId = parseInt(button.getAttribute('data-product-id'));
    
    // Check if user is logged in
    if (!AuthService || !AuthService.isLoggedIn()) {
      alert('Please login to add items to cart');
      window.location.href = '../login/';
      return;
    }
    
    // Disable button
    button.disabled = true;
    button.textContent = 'Adding...';
    
    console.log(`📦 Adding product ${productId} to cart...`);
    
    try {
      const response = await API.addToCart({
        productId: productId,
        quantity: 1
      });
      
      if (response.code === 200) {
        console.log('✅ Product added to cart');
        button.textContent = 'Added!';
        
        // Update cart badge
        if (typeof UserNav !== 'undefined' && UserNav.updateCartBadge) {
          UserNav.updateCartBadge();
        }
        
        // Reset button after 2 seconds
        setTimeout(() => {
          button.disabled = false;
          button.textContent = 'Add to cart';
        }, 2000);
      } else {
        throw new Error(response.msg || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('❌ Failed to add to cart:', error);
      alert('Failed to add to cart. Please try again.');
      button.disabled = false;
      button.textContent = 'Add to cart';
    }
  },
  
  /**
   * Handle add to wishlist
   */
  async handleAddToWishlist(event) {
    event.preventDefault();
    
    const button = event.currentTarget;
    const productId = parseInt(button.getAttribute('data-product-id'));
    
    // Check if user is logged in
    if (!AuthService || !AuthService.isLoggedIn()) {
      alert('Please login to add items to wishlist');
      window.location.href = '../login/';
      return;
    }
    
    console.log(`📦 Adding product ${productId} to wishlist...`);
    
    try {
      const response = await API.addToWishlist(productId);
      
      if (response.code === 200) {
        console.log('✅ Product added to wishlist');
        alert('Product added to wishlist!');
        button.classList.add('added');
      } else {
        throw new Error(response.msg || 'Failed to add to wishlist');
      }
    } catch (error) {
      console.error('❌ Failed to add to wishlist:', error);
      alert('Failed to add to wishlist. Please try again.');
    }
  },
  
  /**
   * Show error message
   */
  showError(message) {
    const container = document.querySelector('.woocommerce-notices-wrapper');
    if (container) {
      container.innerHTML = `
        <div class="woocommerce-error" role="alert">
          ${message}
        </div>
      `;
    }
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ShopList.init());
} else {
  ShopList.init();
}

