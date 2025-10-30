#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修改PNG图片中的黄色图标颜色为 #AFB25B
"""

from PIL import Image
import colorsys
import os

def hex_to_rgb(hex_color):
    """将十六进制颜色转换为RGB"""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def rgb_to_hex(rgb):
    """将RGB转换为十六进制"""
    return '#{:02x}{:02x}{:02x}'.format(int(rgb[0]), int(rgb[1]), int(rgb[2]))

def is_yellow(rgb, tolerance=30):
    """判断颜色是否为黄色"""
    r, g, b = rgb[:3]
    # 黄色的特征：R和G都很高，B很低
    # 转换为HSV来判断
    h, s, v = colorsys.rgb_to_hsv(r/255.0, g/255.0, b/255.0)
    # 黄色的色调范围大约在 45-65 度（0.125-0.18 in HSV）
    # 饱和度应该较高，亮度也应该较高
    hue_deg = h * 360
    return (30 < hue_deg < 70) and s > 0.3 and v > 0.3

def change_yellow_to_target(image_path, target_hex):
    """
    将图片中的黄色改为目标颜色
    """
    # 打开图片
    img = Image.open(image_path)
    
    # 转换为RGBA（如果还不是）
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    # 获取像素数据
    pixels = img.load()
    width, height = img.size
    
    # 目标颜色
    target_rgb = hex_to_rgb(target_hex)
    
    # 遍历所有像素
    for y in range(height):
        for x in range(width):
            pixel = pixels[x, y]
            
            # 检查是否为黄色
            if is_yellow(pixel):
                # 保留透明度
                if len(pixel) == 4:
                    pixels[x, y] = (target_rgb[0], target_rgb[1], target_rgb[2], pixel[3])
                else:
                    pixels[x, y] = target_rgb
    
    # 保存图片
    img.save(image_path)
    print(f"✓ 已修改: {image_path}")

# 要修改的文件列表
files_to_modify = [
    'h1_img-foot-1.png',
    'h1_img-foot.png',
    'h2_decor-1.png'
]

# 目标颜色
target_color = '#AFB25B'

# 获取当前脚本所在目录
current_dir = os.path.dirname(os.path.abspath(__file__))

# 修改每个文件
for filename in files_to_modify:
    file_path = os.path.join(current_dir, filename)
    if os.path.exists(file_path):
        print(f"处理: {filename}")
        change_yellow_to_target(file_path, target_color)
    else:
        print(f"✗ 文件不存在: {file_path}")

print("\n所有文件处理完成！")

