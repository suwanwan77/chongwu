#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
验证修改后的图片颜色
"""

from PIL import Image
from collections import Counter
import os

def analyze_image(image_path):
    """分析图片中的颜色"""
    img = Image.open(image_path)
    
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    pixels = img.load()
    width, height = img.size
    
    # 收集所有颜色
    colors = []
    for y in range(height):
        for x in range(width):
            colors.append(pixels[x, y])
    
    # 统计颜色频率
    color_counts = Counter(colors)
    
    print(f"\n{os.path.basename(image_path)}:")
    print(f"  大小: {width}x{height}")
    print(f"  模式: {img.mode}")
    print(f"  颜色数: {len(color_counts)}")
    print("  前10个颜色:")
    for color, count in color_counts.most_common(10):
        print(f"    {color}: {count}像素")

# 要验证的文件列表
files_to_verify = [
    'h1_img-foot-1.png',
    'h1_img-foot.png',
    'h2_decor-1.png'
]

# 获取当前脚本所在目录
current_dir = os.path.dirname(os.path.abspath(__file__))

# 验证每个文件
for filename in files_to_verify:
    file_path = os.path.join(current_dir, filename)
    if os.path.exists(file_path):
        analyze_image(file_path)
    else:
        print(f"✗ 文件不存在: {file_path}")

print("\n验证完成！")

