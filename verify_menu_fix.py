import os

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

print("验证菜单颜色修复...")
print("="*60)

all_good = True

for file_path in html_files:
    if not os.path.exists(file_path):
        print(f"❌ {file_path} - 文件不存在")
        all_good = False
        continue
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    has_menu_color_css = 'Fix mobile menu colors and hamburger icon hover' in content
    has_main_menu_color = '.mobile-nav-tabs .mobile-tab-title span' in content and '#2F562A' in content
    has_hamburger_hover = '.menu-mobile-nav-button:hover .gopet-icon span' in content
    has_mobile_nav_color = '.mobile-navigation .menu a' in content
    
    if has_menu_color_css and has_main_menu_color and has_hamburger_hover and has_mobile_nav_color:
        print(f"✅ {file_path}")
    else:
        print(f"❌ {file_path} - 缺少CSS修复")
        all_good = False

print("="*60)
if all_good:
    print("✅ 所有17个文件验证通过!")
else:
    print("❌ 部分文件验证失败")

