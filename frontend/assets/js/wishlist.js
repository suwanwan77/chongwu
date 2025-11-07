/**
 * Wishlist Page Dynamic Loading
 * Handles wishlist items display, removal, and add to cart
 */

const Wishlist = {
  wishlistItems: [],
  
  /**
   * Initialize wishlist page
   */
  async init() {
    console.log('📦 Initializing wishlist page...');
    
    // Check if we're on the wishlist page
    if (!document.body.classList.contains('woocommerce-wishlist') && 
        !window.location.pathname.includes('/wishlist/')) {
      console.log('⚠️ Not on wishlist page, skipping initialization');
      return;
    }
    
    try {
      await this.loadWishlist();
      this.bindEvents();
      console.log('✅ Wishlist page initialized');
    } catch (error) {
      console.error('❌ Failed to initialize wishlist page:', error);
      this.showError('Failed to load wishlist. Please refresh the page.');
    }
  },
  
  /**
   * Load wishlist data from API
   */
  async loadWishlist() {
    console.log('📦 Loading wishlist data...');
    
    // Check if user is logged in
    if (!AuthService || !AuthService.isLoggedIn()) {
      console.log('⚠️ User not logged in');
      this.renderEmptyWishlist();
      return;
    }
    
    try {
      const response = await API.getWishlist();
      
      if (response.code === 200) {
        this.wishlistItems = response.data || [];
        console.log(`✅ Wishlist loaded: ${this.wishlistItems.length} items`);
        
        if (this.wishlistItems.length === 0) {
          this.renderEmptyWishlist();
        } else {
          this.renderWishlist();
        }
      } else {
        throw new Error(response.msg || 'Failed to load wishlist');
      }
    } catch (error) {
      console.error('❌ Failed to load wishlist:', error);
      throw error;
    }
  },
  
  /**
   * Render empty wishlist message
   */
  renderEmptyWishlist() {
    console.log('📦 Rendering empty wishlist...');
    
    const container = document.querySelector('.woocommerce') || 
                     document.querySelector('.woosw-content') ||
                     document.querySelector('main');
    
    if (!container) return;
    
    container.innerHTML = `
      <div class="woocommerce-notices-wrapper"></div>
      <div class="woosw-empty">
        <p class="woosw-empty-notice">Your wishlist is currently empty.</p>
        <p class="return-to-shop">
          <a class="button wc-backward" href="../shop/index.html">
            Return to shop
          </a>
        </p>
      </div>
    `;
  },
  
  /**
   * Render wishlist with items
   */
  renderWishlist() {
    console.log('📦 Rendering wishlist with items...');
    
    const container = document.querySelector('.woocommerce') || 
                     document.querySelector('.woosw-content') ||
                     document.querySelector('main');
    
    if (!container) return;
    
    container.innerHTML = `
      <div class="woocommerce-notices-wrapper"></div>
      <div class="woosw-list">
        <h2>My Wishlist (${this.wishlistItems.length} items)</h2>
        <table class="shop_table shop_table_responsive woosw-table">
          <thead>
            <tr>
              <th class="product-remove">&nbsp;</th>
              <th class="product-thumbnail">&nbsp;</th>
              <th class="product-name">Product</th>
              <th class="product-price">Price</th>
              <th class="product-stock-status">Stock Status</th>
              <th class="product-add-to-cart">&nbsp;</th>
            </tr>
          </thead>
          <tbody>
            ${this.renderWishlistItems()}
          </tbody>
        </table>
      </div>
    `;
    
    // Re-bind events after rendering
    this.bindWishlistItemEvents();
  },
  
  /**
   * Render wishlist items HTML
   */
  renderWishlistItems() {
    return this.wishlistItems.map(item => {
      const product = item.product;
      const price = product.salePrice || product.price;
      const hasDiscount = product.salePrice && product.salePrice < product.price;
      const inStock = product.stock > 0;
      
      // Parse main image
      let mainImage = product.mainImage;
      if (typeof mainImage === 'string') {
        try {
          mainImage = JSON.parse(mainImage);
        } catch (e) {
          console.error('Failed to parse mainImage:', e);
        }
      }
      
      // Get thumbnail image URL
      const thumbnailUrl = mainImage?.thumbnail_100 || mainImage?.small_274 || mainImage?.original || '';
      
      return `
        <tr class="woosw-item" data-wishlist-id="${item.wishlistId}" data-product-id="${product.productId}">
          <td class="product-remove">
            <a href="#" class="remove" aria-label="Remove this item" data-wishlist-id="${item.wishlistId}">×</a>
          </td>
          <td class="product-thumbnail">
            <a href="../shop/product-${product.productId}/index.html">
              <img src="${thumbnailUrl}" class="attachment-woocommerce_thumbnail" alt="${product.productName}">
            </a>
          </td>
          <td class="product-name" data-title="Product">
            <a href="../shop/product-${product.productId}/index.html">${product.productName}</a>
          </td>
          <td class="product-price" data-title="Price">
            ${hasDiscount ? `
              <del><span class="woocommerce-Price-amount amount">
                <bdi><span class="woocommerce-Price-currencySymbol">$</span>${product.price.toFixed(2)}</bdi>
              </span></del>
            ` : ''}
            <ins><span class="woocommerce-Price-amount amount">
              <bdi><span class="woocommerce-Price-currencySymbol">$</span>${price.toFixed(2)}</bdi>
            </span></ins>
          </td>
          <td class="product-stock-status" data-title="Stock Status">
            <span class="stock ${inStock ? 'in-stock' : 'out-of-stock'}">
              ${inStock ? 'In stock' : 'Out of stock'}
            </span>
          </td>
          <td class="product-add-to-cart" data-title="Add to cart">
            <button class="button add-to-cart-from-wishlist" 
                    data-product-id="${product.productId}"
                    data-wishlist-id="${item.wishlistId}"
                    ${!inStock ? 'disabled' : ''}>
              Add to cart
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },
  
  /**
   * Bind events
   */
  bindEvents() {
    // Events will be bound after rendering
  },
  
  /**
   * Bind wishlist item events (remove, add to cart)
   */
  bindWishlistItemEvents() {
    // Bind remove button events
    const removeButtons = document.querySelectorAll('.product-remove .remove');
    removeButtons.forEach(button => {
      button.addEventListener('click', (e) => this.handleRemoveItem(e));
    });
    
    // Bind add to cart button events
    const addToCartButtons = document.querySelectorAll('.add-to-cart-from-wishlist');
    addToCartButtons.forEach(button => {
      button.addEventListener('click', (e) => this.handleAddToCart(e));
    });
  },
  
  /**
   * Handle remove item from wishlist
   */
  async handleRemoveItem(event) {
    event.preventDefault();
    
    const button = event.currentTarget;
    const wishlistId = parseInt(button.getAttribute('data-wishlist-id'));
    
    if (!confirm('Are you sure you want to remove this item from your wishlist?')) {
      return;
    }
    
    console.log(`📦 Removing wishlist item ${wishlistId}...`);
    
    try {
      const response = await API.removeFromWishlist(wishlistId);
      
      if (response.code === 200) {
        console.log('✅ Wishlist item removed');
        // Reload wishlist
        await this.loadWishlist();
      } else {
        throw new Error(response.msg || 'Failed to remove wishlist item');
      }
    } catch (error) {
      console.error('❌ Failed to remove wishlist item:', error);
      alert('Failed to remove item. Please try again.');
    }
  },
  
  /**
   * Handle add to cart from wishlist
   */
  async handleAddToCart(event) {
    event.preventDefault();
    
    const button = event.currentTarget;
    const productId = parseInt(button.getAttribute('data-product-id'));
    const wishlistId = parseInt(button.getAttribute('data-wishlist-id'));
    
    // Disable button
    button.disabled = true;
    button.textContent = 'Adding...';
    
    console.log(`📦 Adding product ${productId} to cart from wishlist...`);
    
    try {
      const response = await API.addToCart({
        productId: productId,
        quantity: 1
      });
      
      if (response.code === 200) {
        console.log('✅ Product added to cart');
        
        // Update cart badge
        if (typeof UserNav !== 'undefined' && UserNav.updateCartBadge) {
          UserNav.updateCartBadge();
        }
        
        // Ask if user wants to remove from wishlist
        if (confirm('Product added to cart! Do you want to remove it from your wishlist?')) {
          await API.removeFromWishlist(wishlistId);
          await this.loadWishlist();
        } else {
          button.disabled = false;
          button.textContent = 'Add to cart';
        }
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
  document.addEventListener('DOMContentLoaded', () => Wishlist.init());
} else {
  Wishlist.init();
}

