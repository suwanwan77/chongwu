# Wishlist 功能使用说明

## 功能概述

Wishlist页面已经实现了以下功能：

1. **空状态显示**: 当没有产品被添加到wishlist时，显示 "There are no products on the Wishlist!"
2. **产品卡片显示**: 当有产品被添加时，以卡片形式显示产品信息（图片、名称、描述、价格）
3. **删除功能**: 每个卡片右上角有 × 按钮，点击可删除该产品
4. **响应式布局**: 自动适应不同屏幕尺寸

## 如何在其他页面添加"Add to Wishlist"按钮

在产品页面或产品列表页面，添加以下代码：

### HTML 按钮示例

```html
<button onclick="addProductToWishlist()" class="add-to-wishlist-btn">
    Add to Wishlist
</button>
```

### JavaScript 代码示例

```javascript
<script>
function addProductToWishlist() {
    // 定义产品信息
    const product = {
        id: 'product-123',  // 产品唯一ID
        name: 'Pawganic Cat Litter',  // 产品名称
        description: 'Natural, eco-friendly cat litter made from sustainable materials.',  // 产品描述
        price: '$29.99',  // 产品价格
        image: '../path/to/product-image.jpg'  // 产品图片路径
    };
    
    // 调用全局函数添加到wishlist
    if (typeof window.addToWishlist === 'function') {
        window.addToWishlist(product);
    } else {
        // 如果函数不存在，直接操作localStorage
        let wishlist = localStorage.getItem('pawganic_wishlist');
        wishlist = wishlist ? JSON.parse(wishlist) : [];
        
        // 检查是否已存在
        const exists = wishlist.some(item => item.id === product.id);
        if (!exists) {
            wishlist.push(product);
            localStorage.setItem('pawganic_wishlist', JSON.stringify(wishlist));
            alert('Product added to wishlist!');
        } else {
            alert('Product is already in wishlist!');
        }
    }
}
</script>
```

### 样式示例

```css
<style>
.add-to-wishlist-btn {
    background-color: #5C7524;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.3s;
}

.add-to-wishlist-btn:hover {
    background-color: #2F562A;
}
</style>
```

## 数据结构

Wishlist数据存储在 `localStorage` 中，键名为 `pawganic_wishlist`。

每个产品对象包含以下字段：

```javascript
{
    id: 'string',           // 必需：产品唯一标识符
    name: 'string',         // 必需：产品名称
    description: 'string',  // 可选：产品描述
    price: 'string',        // 必需：产品价格（格式化后的字符串）
    image: 'string'         // 必需：产品图片URL
}
```

## 技术实现

- **存储方式**: localStorage
- **数据格式**: JSON
- **实时更新**: 使用 storage 事件监听跨标签页更新
- **响应式设计**: CSS Grid 自动布局

## 注意事项

1. 确保每个产品有唯一的 `id`
2. 图片路径需要是相对于当前页面的正确路径
3. localStorage 有大小限制（通常5-10MB），不建议存储大量产品
4. 数据仅存储在浏览器本地，清除浏览器数据会丢失wishlist

## 页面路径

Wishlist页面路径: `/frontend/wishlist/index.html`

