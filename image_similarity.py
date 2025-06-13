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
        使用RGB颜色分布比例进行特征提取
        计算图像中每个颜色通道的分布情况和色彩区间占比
        """
        if image is None:
            return None
        
        try:
            # 调整大小以规范化
            image = cv2.resize(image, (256, 256))
            
            # 分离RGB通道
            b, g, r = cv2.split(image)
            
            # 计算每个通道的颜色分布直方图（64个bins）
            bins = 64
            r_hist = cv2.calcHist([r], [0], None, [bins], [0, 256])
            g_hist = cv2.calcHist([g], [0], None, [bins], [0, 256])
            b_hist = cv2.calcHist([b], [0], None, [bins], [0, 256])
            
            # 归一化直方图
            cv2.normalize(r_hist, r_hist, 0, 1, cv2.NORM_MINMAX)
            cv2.normalize(g_hist, g_hist, 0, 1, cv2.NORM_MINMAX)
            cv2.normalize(b_hist, b_hist, 0, 1, cv2.NORM_MINMAX)
            
            # 计算颜色占比特征
            total_pixels = image.shape[0] * image.shape[1]
            
            # 将颜色空间分为低、中、高三个区间
            # 计算每个通道在各区间内的像素占比
            intervals = 3  # 低(0-85)、中(86-170)、高(171-255)
            r_ranges = []
            g_ranges = []
            b_ranges = []
            
            for i in range(intervals):
                lower = i * 256 // intervals
                upper = (i + 1) * 256 // intervals
                
                # 计算每个区间内的像素数量占比
                r_pixels = np.sum((r >= lower) & (r < upper))
                g_pixels = np.sum((g >= lower) & (g < upper))
                b_pixels = np.sum((b >= lower) & (b < upper))
                
                r_ranges.append(r_pixels / total_pixels)
                g_ranges.append(g_pixels / total_pixels)
                b_ranges.append(b_pixels / total_pixels)
            
            # 计算颜色主导性（哪种颜色在图片中更占主导）
            avg_r = np.mean(r) / 255.0
            avg_g = np.mean(g) / 255.0
            avg_b = np.mean(b) / 255.0
            
            # 颜色平衡性（RGB三通道的标准差）
            balance = np.std([avg_r, avg_g, avg_b])
            
            # 合并所有特征
            features = np.concatenate([
                r_hist.flatten(), 
                g_hist.flatten(), 
                b_hist.flatten(),
                np.array(r_ranges),
                np.array(g_ranges),
                np.array(b_ranges),
                np.array([avg_r, avg_g, avg_b, balance])
            ])
            
            return features
        except Exception as e:
            logging.debug(f"特征提取错误: {e}")
            return None
  
    def calculate_similarity(self, features1, features2):
        """
        计算两组特征之间的相似度
        加权组合多种相似度指标来获得更准确的结果
        """
        if features1 is None or features2 is None:
            return 0
            
        try:
            # 特征向量的长度
            feature_length = len(features1)
            
            # 划分特征向量的不同部分
            r_hist_end = 64
            g_hist_end = r_hist_end + 64
            b_hist_end = g_hist_end + 64
            color_ranges_end = b_hist_end + 9  # RGB 三通道各3个区间
            
            # 1. 颜色直方图部分的相似度（使用卡方距离）
            r_hist_similarity = self._calculate_histogram_similarity(
                features1[:r_hist_end], 
                features2[:r_hist_end]
            )
            
            g_hist_similarity = self._calculate_histogram_similarity(
                features1[r_hist_end:g_hist_end], 
                features2[r_hist_end:g_hist_end]
            )
            
            b_hist_similarity = self._calculate_histogram_similarity(
                features1[g_hist_end:b_hist_end], 
                features2[g_hist_end:b_hist_end]
            )
            
            # 2. 颜色区间占比部分的相似度（使用欧氏距离）
            color_ranges_similarity = self._calculate_ranges_similarity(
                features1[b_hist_end:color_ranges_end],
                features2[b_hist_end:color_ranges_end]
            )
            
            # 3. 颜色属性部分的相似度（剩余的4个特征值）
            color_attributes_similarity = self._calculate_attributes_similarity(
                features1[color_ranges_end:],
                features2[color_ranges_end:]
            )
            
            # 权重组合所有相似度指标
            weights = {
                'r_hist': 0.15,
                'g_hist': 0.15,
                'b_hist': 0.15,
                'color_ranges': 0.35,
                'color_attributes': 0.20
            }
            
            final_similarity = (
                weights['r_hist'] * r_hist_similarity +
                weights['g_hist'] * g_hist_similarity +
                weights['b_hist'] * b_hist_similarity +
                weights['color_ranges'] * color_ranges_similarity +
                weights['color_attributes'] * color_attributes_similarity
            )
            
            # 转换为百分比并限制在0-100范围内
            similarity_percent = max(0, min(100, final_similarity * 100))
            
            return similarity_percent
        except Exception as e:
            logging.debug(f"相似度计算错误: {e}")
            return 0
            
    def _calculate_histogram_similarity(self, hist1, hist2):
        """
        计算两个直方图的相似度
        1.0表示完全相同，0表示完全不同
        """
        # 使用余弦相似度
        return 1 - cosine(hist1, hist2)
        
    def _calculate_ranges_similarity(self, ranges1, ranges2):
        """
        计算颜色区间占比的相似度
        使用欧氏距离的归一化倒数
        """
        distance = np.sqrt(np.sum((ranges1 - ranges2) ** 2))
        max_distance = np.sqrt(9)  # 最大可能距离（假设所有9个值差异都是1）
        return 1 - (distance / max_distance)
        
    def _calculate_attributes_similarity(self, attrs1, attrs2):
        """
        计算颜色属性的相似度
        前3个是RGB平均值，最后1个是平衡性
        """
        # RGB平均值的相似度（欧氏距离）
        rgb_distance = np.sqrt(np.sum((attrs1[:3] - attrs2[:3]) ** 2))
        rgb_similarity = 1 - (rgb_distance / np.sqrt(3))  # 归一化
        
        # 平衡性的相似度（直接比较差异）
        balance_similarity = 1 - abs(attrs1[3] - attrs2[3])
        
        # 组合
        return 0.7 * rgb_similarity + 0.3 * balance_similarity
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
