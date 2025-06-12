"""
图像相似度检测模块
"""

import cv2
import numpy as np
from scipy.spatial.distance import cosine
import os
import glob
import time
import logging
from PIL import Image

class ImageSimilarity:
    def __init__(self):
        self.image_database = []
    
    def extract_features(self, image):
        """
        从图像中提取特征
        这个简单实现使用颜色直方图、边缘特征和纹理特征的组合
        实际应用中可以考虑使用深度学习模型提取更强大的特征
        """
        if image is None:
            return None
        
        try:
            # 调整大小以规范化
            image = cv2.resize(image, (256, 256))
            
            # 1. 颜色直方图特征 (HSV空间)
            hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
            hist_hsv = cv2.calcHist([hsv], [0, 1], None, [30, 32], [0, 180, 0, 256])
            cv2.normalize(hist_hsv, hist_hsv)
            
            # 2. 边缘特征 (Canny边缘检测)
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            edges = cv2.Canny(gray, 100, 200)
            edge_hist = cv2.calcHist([edges], [0], None, [32], [0, 256])
            cv2.normalize(edge_hist, edge_hist)
            
            # 3. 纹理特征 (局部二值模式)
            lbp = self._get_lbp(gray)
            lbp_hist = cv2.calcHist([lbp], [0], None, [32], [0, 256])
            cv2.normalize(lbp_hist, lbp_hist)
            
            # 组合特征
            combined_features = np.concatenate([
                hist_hsv.flatten(), 
                edge_hist.flatten(),
                lbp_hist.flatten()
            ])
            return combined_features
        except Exception as e:
            logging.debug(f"特征提取错误: {e}")
            return None
    
    def _get_lbp(self, gray_image):
        """
        计算局部二值模式 (LBP)
        简化版本，仅用于演示
        """
        height, width = gray_image.shape
        lbp_image = np.zeros((height-2, width-2), np.uint8)
        
        for i in range(1, height-1):
            for j in range(1, width-1):
                center = gray_image[i, j]
                code = 0
                
                # 周围8个像素与中心像素比较
                code |= (gray_image[i-1, j-1] >= center) << 7
                code |= (gray_image[i-1, j] >= center) << 6
                code |= (gray_image[i-1, j+1] >= center) << 5
                code |= (gray_image[i, j+1] >= center) << 4
                code |= (gray_image[i+1, j+1] >= center) << 3
                code |= (gray_image[i+1, j] >= center) << 2
                code |= (gray_image[i+1, j-1] >= center) << 1
                code |= (gray_image[i, j-1] >= center) << 0
                
                lbp_image[i-1, j-1] = code
        
        return lbp_image
    
    def calculate_similarity(self, features1, features2):
        """
        计算两组特征之间的相似度
        """
        if features1 is None or features2 is None:
            return 0
        
        # 使用余弦相似度
        similarity = 1 - cosine(features1, features2)
        # 转换为百分比并限制在0-100范围内
        similarity_percent = max(0, min(100, similarity * 100))
        
        return similarity_percent
    def add_to_database(self, image_path, features=None):
        """
        向数据库中添加图像
        """
        if features is None:
            try:
                image = cv2.imread(image_path)
                features = self.extract_features(image)
            except Exception as e:
                # 使用logger而不是print
                logging.debug(f"添加图像到数据库失败: {e}")
                return False
        
        self.image_database.append({
            'path': image_path,
            'features': features,
            'filename': os.path.basename(image_path)
        })
        return True
    def scan_directory(self, directory_path, extensions=('jpg', 'jpeg', 'png', 'gif')):
        """
        扫描目录及其所有子目录中的所有图像并添加到数据库
        """
        # 记录扫描开始状态
        logging.info(f"开始扫描图像目录: {directory_path}")
        
        # 遍历所有子目录
        for root, dirs, files in os.walk(directory_path):
            # 处理每个扩展名
            for ext in extensions:
                # 查找当前目录中符合扩展名的文件
                pattern = os.path.join(root, f"*.{ext}")
                for image_path in glob.glob(pattern):
                    logging.debug(f"发现图像: {image_path}")
                    self.add_to_database(image_path)
        
        logging.info(f"扫描完成，共添加了 {len(self.image_database)} 张图片到数据库")
        return len(self.image_database)
    
    def search(self, query_image, top_k=9):
        """
        搜索最相似的图像
        query_image: 可以是图像路径或opencv图像对象
        """
        # 确保query_image是OpenCV图像
        if isinstance(query_image, str):
            query_image = cv2.imread(query_image)
        
        # 提取查询图像的特征
        query_features = self.extract_features(query_image)
        if query_features is None:
            return []
        
        # 计算与数据库中每个图像的相似度
        similarities = []
        for img in self.image_database:
            similarity = self.calculate_similarity(query_features, img['features'])
            similarities.append({
                'path': img['path'],
                'similarity': similarity,
                'filename': img['filename']
            })
        
        # 按相似度排序
        similarities.sort(key=lambda x: x['similarity'], reverse=True)
        return similarities[:top_k]
