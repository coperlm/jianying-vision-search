"""
图像预热脚本 - 加载所有测试图片到相似度数据库中
"""

import os
import logging
import cv2
from image_similarity import ImageSimilarity

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger('鉴影科技-图像预热')

def scan_all_images(directories):
    """
    扫描所有指定目录中的图片
    """
    image_similarity = ImageSimilarity()
    total_images = 0
    
    for directory in directories:
        if not os.path.exists(directory):
            logger.warning(f"目录不存在: {directory}")
            continue
            
        logger.info(f"扫描目录: {directory}")
        
        # 递归扫描目录
        for root, _, files in os.walk(directory):
            for file in files:
                if file.lower().endswith(('.jpg', '.jpeg', '.png', '.gif', '.bmp')):
                    file_path = os.path.join(root, file)
                    try:
                        # 尝试读取图像
                        image = cv2.imread(file_path)
                        if image is not None:
                            # 提取特征并添加到数据库
                            features = image_similarity.extract_features(image)
                            if features is not None:
                                image_similarity.add_to_database(file_path, features)
                                logger.info(f"添加图片: {file_path}")
                                total_images += 1
                            else:
                                logger.warning(f"无法提取特征: {file_path}")
                        else:
                            logger.warning(f"无法读取图片: {file_path}")
                    except Exception as e:
                        logger.error(f"处理图片出错 {file_path}: {str(e)}")
    
    logger.info(f"共加载了 {total_images} 张图片到数据库")
    logger.info(f"数据库大小: {len(image_similarity.image_database)}")
    return image_similarity

if __name__ == "__main__":
    # 要扫描的目录列表
    directories = [
        os.path.join('static', 'images', 'test'),
        os.path.join('static', 'images', 'web'),
        os.path.join('static', 'uploads')
    ]
    
    # 扫描所有图片
    image_db = scan_all_images(directories)
    
    # 保存数据库大小信息
    with open('image_database_info.txt', 'w') as f:
        f.write(f"图像数据库大小: {len(image_db.image_database)}\n")
        for i, img in enumerate(image_db.image_database):
            f.write(f"{i+1}. {img['path']} ({img['filename']})\n")
    
    logger.info("图像预热完成，信息已保存至 image_database_info.txt")
