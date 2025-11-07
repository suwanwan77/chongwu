/**
 * Order and Address Management
 * Handles order creation, address management (New Zealand format), and order display
 */

const OrderManager = {
  addresses: [],
  selectedAddressId: null,
  cartItems: [],
  
  /**
   * Initialize order manager
   */
  async init() {
    console.log('📦 Initializing order manager...');
    
    // Check if we're on checkout or order page
    const isCheckoutPage = document.body.classList.contains('woocommerce-checkout');
    const isOrderPage = document.body.classList.contains('woocommerce-order-received') || 
                       window.location.pathname.includes('/order-received/');
    
    if (!isCheckoutPage && !isOrderPage) {
      console.log('⚠️ Not on checkout or order page, skipping initialization');
      return;
    }
    
    try {
      if (isCheckoutPage) {
        await this.initCheckout();
      } else if (isOrderPage) {
        await this.initOrderReceived();
      }
      console.log('✅ Order manager initialized');
    } catch (error) {
      console.error('❌ Failed to initialize order manager:', error);
      this.showError('Failed to load page. Please refresh.');
    }
  },
  
  /**
   * Initialize checkout page
   */
  async initCheckout() {
    console.log('📦 Initializing checkout page...');
    
    // Check if user is logged in
    if (!AuthService || !AuthService.isLoggedIn()) {
      alert('Please login to checkout');
      window.location.href = '../login/';
      return;
    }
    
    // Load addresses and cart
    await Promise.all([
      this.loadAddresses(),
      this.loadCart()
    ]);
    
    this.renderCheckoutForm();
    this.bindCheckoutEvents();
  },
  
  /**
   * Initialize order received page
   */
  async initOrderReceived() {
    console.log('📦 Initializing order received page...');
    
    // Get order ID from URL
    const orderId = this.getOrderIdFromURL();
    if (!orderId) {
      console.error('❌ No order ID found in URL');
      return;
    }
    
    await this.loadOrderDetail(orderId);
  },
  
  /**
   * Load addresses from API
   */
  async loadAddresses() {
    console.log('📦 Loading addresses...');
    
    try {
      const response = await API.getAddresses();
      
      if (response.code === 200) {
        this.addresses = response.data || [];
        console.log(`✅ Addresses loaded: ${this.addresses.length} items`);
        
        // Select default address if exists
        const defaultAddress = this.addresses.find(addr => addr.isDefault);
        if (defaultAddress) {
          this.selectedAddressId = defaultAddress.addressId;
        }
      } else {
        throw new Error(response.msg || 'Failed to load addresses');
      }
    } catch (error) {
      console.error('❌ Failed to load addresses:', error);
      throw error;
    }
  },
  
  /**
   * Load cart from API
   */
  async loadCart() {
    console.log('📦 Loading cart...');
    
    try {
      const response = await API.getCart();
      
      if (response.code === 200) {
        this.cartItems = response.data || [];
        console.log(`✅ Cart loaded: ${this.cartItems.length} items`);
        
        if (this.cartItems.length === 0) {
          alert('Your cart is empty');
          window.location.href = '../shop/index.html';
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
   * Load order detail from API
   */
  async loadOrderDetail(orderId) {
    console.log(`📦 Loading order ${orderId}...`);
    
    try {
      const response = await API.getOrderDetail(orderId);
      
      if (response.code === 200) {
        const order = response.data;
        console.log('✅ Order loaded:', order);
        this.renderOrderDetail(order);
      } else {
        throw new Error(response.msg || 'Failed to load order');
      }
    } catch (error) {
      console.error('❌ Failed to load order:', error);
      this.showError('Failed to load order details.');
    }
  },
  
  /**
   * Render checkout form
   */
  renderCheckoutForm() {
    console.log('📦 Rendering checkout form...');
    
    const container = document.querySelector('.woocommerce-checkout') || 
                     document.querySelector('.woocommerce') ||
                     document.querySelector('main');
    
    if (!container) return;
    
    const total = this.calculateTotal();
    
    container.innerHTML = `
      <div class="woocommerce-notices-wrapper"></div>
      <form name="checkout" method="post" class="checkout woocommerce-checkout" action="#" novalidate>
        <div class="col2-set" id="customer_details">
          <div class="col-1">
            <div class="woocommerce-billing-fields">
              <h3>Billing & Shipping Details</h3>
              ${this.renderAddressSelector()}
              ${this.renderAddressForm()}
            </div>
          </div>
          <div class="col-2">
            <div class="woocommerce-additional-fields">
              <h3>Additional Information</h3>
              <div class="woocommerce-additional-fields__field-wrapper">
                <p class="form-row notes" id="order_comments_field">
                  <label for="order_comments" class="">Order notes&nbsp;<span class="optional">(optional)</span></label>
                  <textarea name="order_comments" class="input-text" id="order_comments" placeholder="Notes about your order, e.g. special notes for delivery." rows="2" cols="5"></textarea>
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <h3 id="order_review_heading">Your order</h3>
        <div id="order_review" class="woocommerce-checkout-review-order">
          <table class="shop_table woocommerce-checkout-review-order-table">
            <thead>
              <tr>
                <th class="product-name">Product</th>
                <th class="product-total">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${this.renderOrderItems()}
            </tbody>
            <tfoot>
              <tr class="cart-subtotal">
                <th>Subtotal</th>
                <td><span class="woocommerce-Price-amount amount"><bdi><span class="woocommerce-Price-currencySymbol">$</span>${total.toFixed(2)}</bdi></span></td>
              </tr>
              <tr class="order-total">
                <th>Total</th>
                <td><strong><span class="woocommerce-Price-amount amount"><bdi><span class="woocommerce-Price-currencySymbol">$</span>${total.toFixed(2)}</bdi></span></strong></td>
              </tr>
            </tfoot>
          </table>
          
          <div id="payment" class="woocommerce-checkout-payment">
            <ul class="wc_payment_methods payment_methods methods">
              <li class="wc_payment_method payment_method_cod">
                <input id="payment_method_cod" type="radio" class="input-radio" name="payment_method" value="cod" checked="checked">
                <label for="payment_method_cod">Cash on delivery</label>
              </li>
              <li class="wc_payment_method payment_method_card">
                <input id="payment_method_card" type="radio" class="input-radio" name="payment_method" value="card">
                <label for="payment_method_card">Credit Card</label>
              </li>
            </ul>
            <div class="form-row place-order">
              <button type="submit" class="button alt" name="woocommerce_checkout_place_order" id="place_order" value="Place order">Place order</button>
            </div>
          </div>
        </div>
      </form>
    `;
    
    this.bindCheckoutEvents();
  },
  
  /**
   * Render address selector
   */
  renderAddressSelector() {
    if (this.addresses.length === 0) {
      return '<p>No saved addresses. Please add a new address below.</p>';
    }
    
    return `
      <div class="form-row form-row-wide">
        <label>Select saved address</label>
        <select id="saved-addresses" class="select">
          <option value="">-- Add new address --</option>
          ${this.addresses.map(addr => `
            <option value="${addr.addressId}" ${addr.addressId === this.selectedAddressId ? 'selected' : ''}>
              ${addr.receiverName} - ${addr.streetAddress}, ${addr.suburb}, ${addr.city}, ${addr.region} ${addr.postcode}
            </option>
          `).join('')}
        </select>
      </div>
    `;
  },
  
  /**
   * Render address form (New Zealand format)
   */
  renderAddressForm() {
    const selectedAddress = this.addresses.find(addr => addr.addressId === this.selectedAddressId);
    
    return `
      <div class="address-fields">
        <p class="form-row form-row-first validate-required">
          <label for="receiver_name">Full Name <abbr class="required" title="required">*</abbr></label>
          <input type="text" class="input-text" name="receiver_name" id="receiver_name" 
                 value="${selectedAddress?.receiverName || ''}" required>
        </p>
        <p class="form-row form-row-last validate-required validate-phone">
          <label for="receiver_phone">Phone <abbr class="required" title="required">*</abbr></label>
          <input type="tel" class="input-text" name="receiver_phone" id="receiver_phone" 
                 value="${selectedAddress?.receiverPhone || ''}" required>
        </p>
        <p class="form-row form-row-wide validate-required">
          <label for="street_address">Street Address <abbr class="required" title="required">*</abbr></label>
          <input type="text" class="input-text" name="street_address" id="street_address" 
                 placeholder="House number and street name" 
                 value="${selectedAddress?.streetAddress || ''}" required>
        </p>
        <p class="form-row form-row-first validate-required">
          <label for="suburb">Suburb <abbr class="required" title="required">*</abbr></label>
          <input type="text" class="input-text" name="suburb" id="suburb" 
                 value="${selectedAddress?.suburb || ''}" required>
        </p>
        <p class="form-row form-row-last validate-required">
          <label for="city">City <abbr class="required" title="required">*</abbr></label>
          <input type="text" class="input-text" name="city" id="city" 
                 value="${selectedAddress?.city || ''}" required>
        </p>
        <p class="form-row form-row-first validate-required">
          <label for="region">Region <abbr class="required" title="required">*</abbr></label>
          <select name="region" id="region" class="select" required>
            <option value="">Select a region...</option>
            <option value="Northland" ${selectedAddress?.region === 'Northland' ? 'selected' : ''}>Northland</option>
            <option value="Auckland" ${selectedAddress?.region === 'Auckland' ? 'selected' : ''}>Auckland</option>
            <option value="Waikato" ${selectedAddress?.region === 'Waikato' ? 'selected' : ''}>Waikato</option>
            <option value="Bay of Plenty" ${selectedAddress?.region === 'Bay of Plenty' ? 'selected' : ''}>Bay of Plenty</option>
            <option value="Gisborne" ${selectedAddress?.region === 'Gisborne' ? 'selected' : ''}>Gisborne</option>
            <option value="Hawke's Bay" ${selectedAddress?.region === 'Hawke\'s Bay' ? 'selected' : ''}>Hawke's Bay</option>
            <option value="Taranaki" ${selectedAddress?.region === 'Taranaki' ? 'selected' : ''}>Taranaki</option>
            <option value="Manawatu-Whanganui" ${selectedAddress?.region === 'Manawatu-Whanganui' ? 'selected' : ''}>Manawatu-Whanganui</option>
            <option value="Wellington" ${selectedAddress?.region === 'Wellington' ? 'selected' : ''}>Wellington</option>
            <option value="Tasman" ${selectedAddress?.region === 'Tasman' ? 'selected' : ''}>Tasman</option>
            <option value="Nelson" ${selectedAddress?.region === 'Nelson' ? 'selected' : ''}>Nelson</option>
            <option value="Marlborough" ${selectedAddress?.region === 'Marlborough' ? 'selected' : ''}>Marlborough</option>
            <option value="West Coast" ${selectedAddress?.region === 'West Coast' ? 'selected' : ''}>West Coast</option>
            <option value="Canterbury" ${selectedAddress?.region === 'Canterbury' ? 'selected' : ''}>Canterbury</option>
            <option value="Otago" ${selectedAddress?.region === 'Otago' ? 'selected' : ''}>Otago</option>
            <option value="Southland" ${selectedAddress?.region === 'Southland' ? 'selected' : ''}>Southland</option>
          </select>
        </p>
        <p class="form-row form-row-last validate-required validate-postcode">
          <label for="postcode">Postcode <abbr class="required" title="required">*</abbr></label>
          <input type="text" class="input-text" name="postcode" id="postcode" 
                 value="${selectedAddress?.postcode || ''}" required>
        </p>
        <p class="form-row form-row-wide">
          <label for="save_address">
            <input type="checkbox" name="save_address" id="save_address" value="1" ${!selectedAddress ? 'checked' : ''}>
            Save this address for future orders
          </label>
        </p>
      </div>
    `;
  },
  
  /**
   * Render order items
   */
  renderOrderItems() {
    return this.cartItems.map(item => {
      const product = item.product;
      const price = product.salePrice || product.price;
      const subtotal = price * item.quantity;
      
      return `
        <tr class="cart_item">
          <td class="product-name">
            ${product.productName}&nbsp;<strong class="product-quantity">× ${item.quantity}</strong>
          </td>
          <td class="product-total">
            <span class="woocommerce-Price-amount amount">
              <bdi><span class="woocommerce-Price-currencySymbol">$</span>${subtotal.toFixed(2)}</bdi>
            </span>
          </td>
        </tr>
      `;
    }).join('');
  },
  
  /**
   * Calculate total
   */
  calculateTotal() {
    return this.cartItems.reduce((total, item) => {
      const price = item.product.salePrice || item.product.price;
      return total + (price * item.quantity);
    }, 0);
  },
  
  /**
   * Bind checkout events
   */
  bindCheckoutEvents() {
    // Bind address selector change
    const addressSelector = document.getElementById('saved-addresses');
    if (addressSelector) {
      addressSelector.addEventListener('change', (e) => this.handleAddressChange(e));
    }
    
    // Bind form submit
    const checkoutForm = document.querySelector('.woocommerce-checkout');
    if (checkoutForm) {
      checkoutForm.addEventListener('submit', (e) => this.handleCheckoutSubmit(e));
    }
  },
  
  /**
   * Handle address selector change
   */
  handleAddressChange(event) {
    const addressId = parseInt(event.target.value);
    this.selectedAddressId = addressId || null;
    
    // Re-render address form
    const addressFieldsContainer = document.querySelector('.address-fields');
    if (addressFieldsContainer) {
      addressFieldsContainer.outerHTML = this.renderAddressForm();
    }
  },
  
  /**
   * Handle checkout form submit
   */
  async handleCheckoutSubmit(event) {
    event.preventDefault();
    
    console.log('📦 Submitting checkout form...');
    
    // Get form data
    const formData = new FormData(event.target);
    const paymentMethod = formData.get('payment_method');
    const orderNotes = formData.get('order_comments');
    const saveAddress = formData.get('save_address') === '1';
    
    // Get address data
    const addressData = {
      receiverName: formData.get('receiver_name'),
      receiverPhone: formData.get('receiver_phone'),
      streetAddress: formData.get('street_address'),
      suburb: formData.get('suburb'),
      city: formData.get('city'),
      region: formData.get('region'),
      postcode: formData.get('postcode'),
      isDefault: false
    };
    
    // Validate address data
    if (!addressData.receiverName || !addressData.receiverPhone || !addressData.streetAddress || 
        !addressData.suburb || !addressData.city || !addressData.region || !addressData.postcode) {
      alert('Please fill in all required address fields');
      return;
    }
    
    try {
      // Save address if needed
      let addressId = this.selectedAddressId;
      if (!addressId && saveAddress) {
        console.log('📦 Saving new address...');
        const addressResponse = await API.createAddress(addressData);
        if (addressResponse.code === 200) {
          addressId = addressResponse.data.addressId;
          console.log(`✅ Address saved: ${addressId}`);
        }
      }
      
      if (!addressId) {
        alert('Please select or save an address');
        return;
      }
      
      // Create order
      console.log('📦 Creating order...');
      const orderData = {
        addressId: addressId,
        paymentMethod: paymentMethod,
        remark: orderNotes || ''
      };
      
      const orderResponse = await API.createOrder(orderData);
      
      if (orderResponse.code === 200) {
        const order = orderResponse.data;
        console.log('✅ Order created:', order);
        
        // Redirect to order received page
        window.location.href = `../order-received/index.html?order_id=${order.orderId}`;
      } else {
        throw new Error(orderResponse.msg || 'Failed to create order');
      }
    } catch (error) {
      console.error('❌ Failed to create order:', error);
      alert('Failed to place order. Please try again.');
    }
  },
  
  /**
   * Render order detail
   */
  renderOrderDetail(order) {
    console.log('📦 Rendering order detail...');
    
    const container = document.querySelector('.woocommerce') || 
                     document.querySelector('main');
    
    if (!container) return;
    
    const address = order.address;
    const items = order.items || [];
    
    container.innerHTML = `
      <div class="woocommerce-order">
        <p class="woocommerce-notice woocommerce-notice--success woocommerce-thankyou-order-received">
          Thank you. Your order has been received.
        </p>
        
        <ul class="woocommerce-order-overview woocommerce-thankyou-order-details order_details">
          <li class="woocommerce-order-overview__order order">
            Order number: <strong>${order.orderNo}</strong>
          </li>
          <li class="woocommerce-order-overview__date date">
            Date: <strong>${new Date(order.createTime).toLocaleDateString()}</strong>
          </li>
          <li class="woocommerce-order-overview__total total">
            Total: <strong><span class="woocommerce-Price-amount amount"><bdi><span class="woocommerce-Price-currencySymbol">$</span>${order.totalAmount.toFixed(2)}</bdi></span></strong>
          </li>
          <li class="woocommerce-order-overview__payment-method method">
            Payment method: <strong>${order.paymentMethod === 'cod' ? 'Cash on delivery' : 'Credit Card'}</strong>
          </li>
        </ul>
        
        <section class="woocommerce-order-details">
          <h2 class="woocommerce-order-details__title">Order details</h2>
          <table class="woocommerce-table woocommerce-table--order-details shop_table order_details">
            <thead>
              <tr>
                <th class="woocommerce-table__product-name product-name">Product</th>
                <th class="woocommerce-table__product-table product-total">Total</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr class="woocommerce-table__line-item order_item">
                  <td class="woocommerce-table__product-name product-name">
                    ${item.product?.productName || 'Product'}&nbsp;<strong class="product-quantity">× ${item.quantity}</strong>
                  </td>
                  <td class="woocommerce-table__product-total product-total">
                    <span class="woocommerce-Price-amount amount">
                      <bdi><span class="woocommerce-Price-currencySymbol">$</span>${item.subtotal.toFixed(2)}</bdi>
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row">Subtotal:</th>
                <td><span class="woocommerce-Price-amount amount"><bdi><span class="woocommerce-Price-currencySymbol">$</span>${order.totalAmount.toFixed(2)}</bdi></span></td>
              </tr>
              <tr>
                <th scope="row">Total:</th>
                <td><span class="woocommerce-Price-amount amount"><bdi><span class="woocommerce-Price-currencySymbol">$</span>${order.totalAmount.toFixed(2)}</bdi></span></td>
              </tr>
            </tfoot>
          </table>
        </section>
        
        <section class="woocommerce-customer-details">
          <h2 class="woocommerce-column__title">Billing & Shipping address</h2>
          <address>
            ${address.receiverName}<br>
            ${address.streetAddress}<br>
            ${address.suburb}<br>
            ${address.city}, ${address.region} ${address.postcode}<br>
            <p class="woocommerce-customer-details--phone">${address.receiverPhone}</p>
          </address>
        </section>
      </div>
    `;
  },
  
  /**
   * Get order ID from URL
   */
  getOrderIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('order_id');
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
  document.addEventListener('DOMContentLoaded', () => OrderManager.init());
} else {
  OrderManager.init();
}

