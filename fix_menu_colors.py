import os
import re

# 所有需要修改的HTML文件(包括home页在内的17个页面)
html_files = [
    'frontend/index.html',
    'frontend/about-us/index.html',
    'frontend/blog-list/index.html',
    'frontend/blog-list/page/2/index.html',
    'frontend/cart/index.html',
    'frontend/contact-us/index.html',
    'frontend/faq/index.html',
    'frontend/my-account/index.html',
    'frontend/my-account/lost-password/index.html',
    'frontend/pricing/index.html',
    'frontend/senior-pets-how-much-to-feed-your-pet/index.html',
    'frontend/shop/index.html',
    'frontend/shop/intelligent-marble-knife/index.html',
    'frontend/understanding-pet-food-labels/index.html',
    'frontend/order-received/index.html',
    'frontend/shop/-canvas_4_grid.html',
    'frontend/shop/-canvas_4_list.html',
]

css_to_add = """
/* Fix mobile menu colors and hamburger icon hover */
.mobile-nav-tabs .mobile-tab-title span {
    color: #2F562A !important;
}

.menu-mobile-nav-button:hover .gopet-icon span,
.menu-mobile-nav-button:focus .gopet-icon span {
    background-color: #2F562A !important;
}

.mobile-navigation .menu a {
    color: #2F562A !important;
}

.mobile-navigation .sub-menu a {
    color: #2F562A !important;
}
"""

# 删除Shop菜单项右侧的图标 - 查找并删除</li>前的空行或图标
def remove_shop_icon(content):
    # 查找Shop菜单项的模式: <a href="...shop...">Shop</a> 后面可能有图标或空行，然后是</li>
    # 模式1: Shop</a>\n</li> - 正常情况
    # 模式2: Shop</a>\n<icon>...</icon>\n</li> - 有图标的情况
    
    # 使用正则表达式删除Shop链接后、</li>前的任何内容(除了换行)
    pattern = r'(<a[^>]*>Shop</a>)\s*\n\s*</li>'
    replacement = r'\1\n</li>'
    content = re.sub(pattern, replacement, content)
    
    return content

for file_path in html_files:
    if not os.path.exists(file_path):
        print(f"⚠️  文件不存在: {file_path}")
        continue
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 检查是否已经添加过CSS
        if 'Fix mobile menu colors and hamburger icon hover' in content:
            print(f"⏭️  {file_path} - 已经修复过,跳过")
            continue
        
        # 删除Shop图标
        content = remove_shop_icon(content)
        
        # 在</style>标签前添加CSS(在最后一个</style>前)
        # 查找最后一个</style>标签的位置
        last_style_pos = content.rfind('</style>')
        
        if last_style_pos != -1:
            # 在最后一个</style>前插入CSS
            content = content[:last_style_pos] + css_to_add + '\n' + content[last_style_pos:]
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            print(f"✅ {file_path} - 修复完成")
        else:
            print(f"❌ {file_path} - 未找到</style>标签")
    
    except Exception as e:
        print(f"❌ {file_path} - 错误: {str(e)}")

print("\n" + "="*60)
print("修复完成!")
print("="*60)

