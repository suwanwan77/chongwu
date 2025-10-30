import os

print("验证SPCA图片和内容添加...")
print("="*60)

# 检查spca.png文件是否存在
spca_image_path = 'spca.png'
if os.path.exists(spca_image_path):
    print(f"✅ SPCA图片文件存在: {spca_image_path}")
else:
    print(f"❌ SPCA图片文件不存在: {spca_image_path}")

# 检查home页面
home_file = 'frontend/index.html'
print(f"\n检查 {home_file}...")
with open(home_file, 'r', encoding='utf-8') as f:
    home_content = f.read()

home_checks = {
    'SPCA图片引用': 'src="spca.png"' in home_content,
    'SPCA标题': '<h3 class="entry-title"' in home_content and '>SPCA</a></h3>' in home_content,
    'SPCA描述': 'Society for the Prevention of Cruelty to Animals' in home_content,
    'More charity按钮': 'more-charity button' in home_content,
}

for check_name, result in home_checks.items():
    status = "✅" if result else "❌"
    print(f"  {status} {check_name}")

# 检查Charity页面
charity_file = 'frontend/blog-list/index.html'
print(f"\n检查 {charity_file}...")
with open(charity_file, 'r', encoding='utf-8') as f:
    charity_content = f.read()

charity_checks = {
    'SPCA图片引用': 'src="../spca.png"' in charity_content,
    'SPCA标题': '<h3>SPCA</h3>' in charity_content,
    'SPCA描述': 'Society for the Prevention of Cruelty to Animals' in charity_content,
    'CSS样式 - spca-image': '.spca-image' in charity_content,
    'CSS样式 - spca-content': '.spca-content' in charity_content,
    'CSS样式 - flex布局': 'display: flex' in charity_content,
}

for check_name, result in charity_checks.items():
    status = "✅" if result else "❌"
    print(f"  {status} {check_name}")

print("\n" + "="*60)
all_home_passed = all(home_checks.values())
all_charity_passed = all(charity_checks.values())

if all_home_passed and all_charity_passed:
    print("✅ 所有验证通过!")
else:
    print("❌ 部分验证失败")
    if not all_home_passed:
        print("  - Home页面有问题")
    if not all_charity_passed:
        print("  - Charity页面有问题")

