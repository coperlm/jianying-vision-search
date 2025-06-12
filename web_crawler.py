"""
网络图像爬取模块 - 修改版：只使用本地图片库
"""

import os
import time
import random
import cv2
import numpy as np
from PIL import Image
import hashlib
import traceback
import logging
from io import BytesIO

# 配置日志
logger = logging.getLogger('LocalImageCrawler')

class WebImageCrawler:
    """
    WebImageCrawler类修改为只使用本地图片
    保留了类名以确保与现有代码兼容
    """
    def __init__(self, save_dir='static/images/web', user_agent=None, verify_ssl=False, max_retries=3):
        self.save_dir = save_dir
        self.test_dir = os.path.join('static', 'images', 'test')
        
        # 确保保存目录存在
        os.makedirs(self.save_dir, exist_ok=True)
        os.makedirs(self.test_dir, exist_ok=True)
        
        # 创建本地测试图像
        self._create_test_images()
    def search_images(self, keywords, max_results=20):
        """
        模拟搜索功能 - 只返回本地测试图片的URL列表
        """
        # 不输出冗余信息
        
        # 模拟搜索延迟（降低为0.1秒）
        time.sleep(0.1)
        
        # 返回本地图像的路径
        return self._get_local_image_paths(max_results)
    def _get_mock_image_urls(self, count):
        """
        生成测试图像路径列表 - 用于与现有代码兼容
        """
        return self._get_local_image_paths(count)
        
    def _get_local_image_paths(self, count):
        """
        返回本地测试图像的路径列表
        """
        paths = []
        
        # 确保测试图像目录存在
        if not os.path.exists(self.test_dir):
            self._create_test_images()
            
        # 获取所有测试图像
        files = [f for f in os.listdir(self.test_dir) if f.endswith(('.jpg', '.jpeg', '.png', '.gif'))]
        
        if not files:
            logging.warning("测试图像目录中没有找到图片，尝试创建测试图片")
            self._create_test_images()
            # 再次尝试获取文件
            files = [f for f in os.listdir(self.test_dir) if f.endswith(('.jpg', '.jpeg', '.png', '.gif'))]
            if not files:
                logging.error("无法创建测试图片，测试图像目录仍然为空")
                return paths
        
        # 如果count为-1或超过文件数量，返回所有图片
        if count == -1 or count >= len(files):
            for file in files:
                paths.append(os.path.join(self.test_dir, file))
            logging.debug(f"返回所有测试图片: {len(paths)}张")
            return paths
            
        # 随机选择指定数量的图像
        selected_files = []
        files_copy = files.copy()  # 创建副本避免修改原始列表
        for i in range(min(count, len(files))):
            if not files_copy:
                break
            selected = random.choice(files_copy)
            selected_files.append(selected)
            # 避免选择相同的图像
            files_copy.remove(selected)
        
        # 生成完整路径
        for file in selected_files:
            paths.append(os.path.join(self.test_dir, file))
        
        logging.debug(f"返回 {len(paths)} 张测试图片")
        return paths
    def _create_test_images(self):
        """
        创建本地测试图像，仅在测试图像不存在时创建
        """
        # 检查是否已经有测试图像
        if not os.path.exists(self.test_dir):
            os.makedirs(self.test_dir, exist_ok=True)
            
        existing_files = os.listdir(self.test_dir)
        if existing_files:
            # 安静地继续，不打印信息
            return
            
        # 使用logger记录但不在控制台打印
        logger.info("创建本地测试图像")
        colors = [
            (255, 0, 0),    # 红色
            (0, 255, 0),    # 绿色
            (0, 0, 255),    # 蓝色
            (255, 255, 0),  # 黄色
            (255, 0, 255),  # 洋红
            (0, 255, 255),  # 青色
            (128, 0, 0),    # 深红
            (0, 128, 0),    # 深绿
            (0, 0, 128),    # 深蓝
            (128, 128, 0),  # 橄榄
            (128, 0, 128),  # 紫色
            (0, 128, 128),  # 蓝绿
        ]
        
        # 创建带有渐变的图像
        for i in range(12):
            # 创建一个渐变色背景
            img = np.zeros((300, 300, 3), np.uint8)
            
            if i < len(colors):
                primary_color = colors[i]
            else:
                # 随机生成颜色
                primary_color = (random.randint(0, 255), 
                               random.randint(0, 255), 
                               random.randint(0, 255))
            
            # 创建渐变效果
            for y in range(300):
                for x in range(300):
                    # 根据像素位置计算颜色值
                    factor_x = x / 300.0
                    factor_y = y / 300.0
                    r = int(primary_color[0] * factor_x)
                    g = int(primary_color[1] * factor_y)
                    b = int(primary_color[2] * (1 - (factor_x + factor_y) / 2))
                    img[y, x] = (r, g, b)
            
            # 添加简单的几何形状
            shape_type = i % 3
            if shape_type == 0:  # 圆形
                cv2.circle(img, (150, 150), 80, (255, 255, 255), -1)
                cv2.circle(img, (150, 150), 60, primary_color, -1)
            elif shape_type == 1:  # 矩形
                cv2.rectangle(img, (70, 70), (230, 230), (255, 255, 255), -1)
                cv2.rectangle(img, (90, 90), (210, 210), primary_color, -1)
            else:  # 三角形
                points = np.array([[150, 50], [50, 250], [250, 250]], np.int32)
                cv2.fillPoly(img, [points], (255, 255, 255))
                points = np.array([[150, 80], [80, 220], [220, 220]], np.int32)
                cv2.fillPoly(img, [points], primary_color)
            
            # 添加文本
            cv2.putText(img, f"Test {i+1}", (50, 40), cv2.FONT_HERSHEY_SIMPLEX, 
                        1, (255, 255, 255), 2, cv2.LINE_AA)
            
            # 保存图像
            file_path = os.path.join(self.test_dir, f"test_image_{i+1}.jpg")
            cv2.imwrite(file_path, img)
            # 不打印创建信息
    def download_images(self, urls, keyword=None):
        """
        获取本地图像并返回路径
        """
        saved_paths = []
        logger.debug(f"正在获取{len(urls)}张本地图片")
        
        for i, url in enumerate(urls):
            try:
                # 如果URL是本地文件路径，直接使用
                if os.path.isfile(url):
                    saved_paths.append(url)
                    logger.debug(f"使用本地图片: {url}")
                # 否则使用测试图像
                else:
                    local_path = self._get_random_test_image()
                    if local_path:
                        saved_paths.append(local_path)
                        logger.debug(f"使用测试图片: {local_path}")
            except Exception as e:
                logger.error(f"获取图片失败 {url}: {str(e)}")
                if logger.isEnabledFor(logging.DEBUG):
                    traceback.print_exc()
        
        # 确保至少有一些图像
        if not saved_paths:
            logger.info("没有找到任何图片，将使用所有测试图片")
            saved_paths = self._get_all_test_images()
        
        logger.debug(f"成功获取了 {len(saved_paths)} 张图片")
        return saved_paths
    
    def _get_random_test_image(self):
        """获取一个随机的测试图像路径"""
        if not os.path.exists(self.test_dir):
            self._create_test_images()
            
        files = [f for f in os.listdir(self.test_dir) if f.endswith('.jpg')]
        if not files:
            return None
            
        random_file = random.choice(files)
        return os.path.join(self.test_dir, random_file)
    
    def _get_all_test_images(self):
        """获取所有测试图像的路径"""
        if not os.path.exists(self.test_dir):
            self._create_test_images()
            
        paths = []
        for f in os.listdir(self.test_dir):
            if f.endswith(('.jpg', '.jpeg', '.png', '.gif')):
                paths.append(os.path.join(self.test_dir, f))
                
        return paths
    def extract_features_from_url(self, url):
        """
        从图像路径提取特征
        """
        try:
            # 对于本地文件路径
            if os.path.isfile(url):
                image = cv2.imread(url)
                
                if image is None:
                    return None
                
                # 调整大小以规范化
                image = cv2.resize(image, (256, 256))
                
                # 提取特征
                hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
                hist = cv2.calcHist([hsv], [0, 1], None, [30, 32], [0, 256, 0, 256])
                cv2.normalize(hist, hist)
                
                return hist.flatten()
            else:
                logger.debug(f"不是有效的文件路径: {url}")
                return None
        except Exception as e:
            logger.debug(f"提取特征失败: {e}")
            if logger.isEnabledFor(logging.DEBUG):
                traceback.print_exc()
            return None