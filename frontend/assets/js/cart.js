/**
 * Shopping Cart Page Dynamic Loading
 * Handles cart items display, quantity updates, item removal, and total calculation
 */

const Cart = {
  cartItems: [],
  
  /**
   * Initialize cart page
   */
  async init() {
    console.log('📦 Initializing cart page...');
    
    // Check if we're on the cart page
    if (!document.body.classList.contains('woocommerce-cart')) {
      console.log('⚠️ Not on cart page, skipping initialization');
      return;
    }
    
    try {
      await this.loadCart();
      this.bindEvents();
      console.log('✅ Cart page initialized');
    } catch (error) {
      console.error('❌ Failed to initialize cart page:', error);
      this.showError('Failed to load cart. Please refresh the page.');
    }
  },
  
  /**
   * Load cart data from API
   */
  async loadCart() {
    console.log('📦 Loading cart data...');
    
    // Check if user is logged in
    if (!AuthService || !AuthService.isLoggedIn()) {
      console.log('⚠️ User not logged in');
      this.renderEmptyCart();
      return;
    }
    
    try {
      const response = await API.getCart();
      
      if (response.code === 200) {
        this.cartItems = response.data || [];
        console.log(`✅ Cart loaded: ${this.cartItems.length} items`);
        
        if (this.cartItems.length === 0) {
          this.renderEmptyCart();
        } else {
          this.renderCart();
        }
        
        // Update cart badge in header
        if (typeof UserNav !== 'undefined' && UserNav.updateCartBadge) {
          UserNav.updateCartBadge();
        }
      } else {
        throw new Error(response.msg || 'Failed to load cart');
      }
    } catch (error) {
      console.error('❌ Failed to load cart:', error);
      throw error;
    }
  },
  
  /**
   * Render empty cart message
   */
  renderEmptyCart() {
    console.log('📦 Rendering empty cart...');
    
    const container = document.querySelector('.woocommerce');
    if (!container) return;
    
    container.innerHTML = `
      <div class="woocommerce-notices-wrapper"></div>
      <div class="wc-empty-cart-message">
        <div class="cart-empty woocommerce-info">
          Your cart is currently empty.
        </div>
      </div>
      <p class="return-to-shop">
        <a class="button wc-backward" href="../shop/index.html">
          Return to shop
        </a>
      </p>
    `;
  },
  
  /**
   * Render cart with items
   */
  renderCart() {
    console.log('📦 Rendering cart with items...');
    
    const container = document.querySelector('.woocommerce');
    if (!container) return;
    
    // Calculate totals
    const subtotal = this.calculateSubtotal();
    const shipping = 0; // Free shipping for now
    const total = subtotal + shipping;
    
    container.innerHTML = `
      <div class="woocommerce-notices-wrapper"></div>
      <form class="woocommerce-cart-form" action="" method="post">
        <table class="shop_table shop_table_responsive cart woocommerce-cart-form__contents" cellspacing="0">
          <thead>
            <tr>
              <th class="product-remove">&nbsp;</th>
              <th class="product-thumbnail">&nbsp;</th>
              <th class="product-name">Product</th>
              <th class="product-price">Price</th>
              <th class="product-quantity">Quantity</th>
              <th class="product-subtotal">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${this.renderCartItems()}
          </tbody>
        </table>
      </form>
      
      <div class="cart-collaterals">
        <div class="cart_totals">
          <h2>Cart totals</h2>
          <table cellspacing="0" class="shop_table shop_table_responsive">
            <tbody>
              <tr class="cart-subtotal">
                <th>Subtotal</th>
                <td data-title="Subtotal">
                  <span class="woocommerce-Price-amount amount">
                    <bdi><span class="woocommerce-Price-currencySymbol">$</span>${subtotal.toFixed(2)}</bdi>
                  </span>
                </td>
              </tr>
              <tr class="woocommerce-shipping-totals shipping">
                <th>Shipping</th>
                <td data-title="Shipping">
                  Free shipping
                </td>
              </tr>
              <tr class="order-total">
                <th>Total</th>
                <td data-title="Total">
                  <strong>
                    <span class="woocommerce-Price-amount amount">
                      <bdi><span class="woocommerce-Price-currencySymbol">$</span>${total.toFixed(2)}</bdi>
                    </span>
                  </strong>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="wc-proceed-to-checkout">
            <a href="../checkout/index.html" class="checkout-button button alt wc-forward">
              Proceed to checkout
            </a>
          </div>
        </div>
      </div>
    `;
    
    // Re-bind events after rendering
    this.bindCartItemEvents();
  },
  
  /**
   * Render cart items HTML
   */
  renderCartItems() {
    return this.cartItems.map(item => {
      const product = item.product;
      const price = product.salePrice || product.price;
      const subtotal = price * item.quantity;
      
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
        <tr class="woocommerce-cart-form__cart-item cart_item" data-cart-id="${item.cartId}">
          <td class="product-remove">
            <a href="#" class="remove" aria-label="Remove this item" data-cart-id="${item.cartId}">×</a>
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
            <span class="woocommerce-Price-amount amount">
              <bdi><span class="woocommerce-Price-currencySymbol">$</span>${price.toFixed(2)}</bdi>
            </span>
          </td>
          <td class="product-quantity" data-title="Quantity">
            <div class="quantity">
              <input type="number" class="input-text qty text" 
                     value="${item.quantity}" 
                     min="1" 
                     max="999" 
                     step="1"
                     data-cart-id="${item.cartId}">
            </div>
          </td>
          <td class="product-subtotal" data-title="Subtotal">
            <span class="woocommerce-Price-amount amount">
              <bdi><span class="woocommerce-Price-currencySymbol">$</span>${subtotal.toFixed(2)}</bdi>
            </span>
          </td>
        </tr>
      `;
    }).join('');
  },
  
  /**
   * Calculate cart subtotal
   */
  calculateSubtotal() {
    return this.cartItems.reduce((total, item) => {
      const price = item.product.salePrice || item.product.price;
      return total + (price * item.quantity);
    }, 0);
  },
  
  /**
   * Bind events
   */
  bindEvents() {
    // Events will be bound after rendering
  },
  
  /**
   * Bind cart item events (quantity change, remove)
   */
  bindCartItemEvents() {
    // Bind quantity change events
    const quantityInputs = document.querySelectorAll('.quantity input[type="number"]');
    quantityInputs.forEach(input => {
      input.addEventListener('change', (e) => this.handleQuantityChange(e));
    });
    
    // Bind remove button events
    const removeButtons = document.querySelectorAll('.product-remove .remove');
    removeButtons.forEach(button => {
      button.addEventListener('click', (e) => this.handleRemoveItem(e));
    });
  },
  
  /**
   * Handle quantity change
   */
  async handleQuantityChange(event) {
    const input = event.target;
    const cartId = parseInt(input.getAttribute('data-cart-id'));
    const newQuantity = parseInt(input.value);
    
    if (newQuantity < 1) {
      input.value = 1;
      return;
    }
    
    console.log(`📦 Updating cart item ${cartId} quantity to ${newQuantity}...`);
    
    try {
      const response = await API.updateCartItem(cartId, newQuantity);
      
      if (response.code === 200) {
        console.log('✅ Cart item updated');
        // Reload cart to update totals
        await this.loadCart();
      } else {
        throw new Error(response.msg || 'Failed to update cart item');
      }
    } catch (error) {
      console.error('❌ Failed to update cart item:', error);
      alert('Failed to update quantity. Please try again.');
      // Reload cart to restore original quantity
      await this.loadCart();
    }
  },
  
  /**
   * Handle remove item
   */
  async handleRemoveItem(event) {
    event.preventDefault();
    
    const button = event.currentTarget;
    const cartId = parseInt(button.getAttribute('data-cart-id'));
    
    if (!confirm('Are you sure you want to remove this item from your cart?')) {
      return;
    }
    
    console.log(`📦 Removing cart item ${cartId}...`);
    
    try {
      const response = await API.removeFromCart(cartId);
      
      if (response.code === 200) {
        console.log('✅ Cart item removed');
        // Reload cart
        await this.loadCart();
      } else {
        throw new Error(response.msg || 'Failed to remove cart item');
      }
    } catch (error) {
      console.error('❌ Failed to remove cart item:', error);
      alert('Failed to remove item. Please try again.');
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
  document.addEventListener('DOMContentLoaded', () => Cart.init());
} else {
  Cart.init();
}

