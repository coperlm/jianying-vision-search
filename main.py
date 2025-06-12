"""
鉴影科技 - 图像相似度检测系统
主程序入口
"""

import os
import datetime
import time
import threading
import logging
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, send_from_directory
from werkzeug.utils import secure_filename
import cv2
import numpy as np
import uuid
import json

from image_similarity import ImageSimilarity
from upload_handler import UploadHandler
from web_crawler import WebImageCrawler

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('鉴影科技')

# 创建Flask应用
app = Flask(__name__)
app.secret_key = 'jianying_keji_2025_security_key'
app.config['UPLOAD_FOLDER'] = os.path.join('static', 'uploads')
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif'}
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload

# 初始化处理模块
upload_handler = UploadHandler(app.config)
image_similarity = ImageSimilarity()
web_crawler = WebImageCrawler()

# 确保上传与图像目录存在
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(os.path.join('static', 'images'), exist_ok=True)

# 全局统计计数器
PROCESSED_COUNT = 0
UPLOADS_BY_DATE = {}

def get_processed_count():
    """获取已处理的图像数量"""
    global PROCESSED_COUNT
    return PROCESSED_COUNT

def increment_processed_count():
    """增加处理计数"""
    global PROCESSED_COUNT
    PROCESSED_COUNT += 1

def get_uploads_today():
    """获取今日上传数量"""
    today = datetime.datetime.now().strftime('%Y-%m-%d')
    return UPLOADS_BY_DATE.get(today, 0)

def record_upload():
    """记录上传"""
    today = datetime.datetime.now().strftime('%Y-%m-%d')
    UPLOADS_BY_DATE[today] = UPLOADS_BY_DATE.get(today, 0) + 1

def init_image_database():
    """初始化图像数据库"""
    # 确保测试图像目录存在
    test_dir = os.path.join('static', 'images', 'test')
    os.makedirs(test_dir, exist_ok=True)
    
    # 先检查test目录是否有图片
    test_images = [f for f in os.listdir(test_dir) if f.endswith(('.jpg', '.jpeg', '.png', '.gif'))]
    
    # 如果test目录没有图片，创建测试图片
    if not test_images:
        logger.info("测试图像目录为空，创建测试图片...")
        web_crawler._create_test_images()
    
    # 扫描所有图像目录（包括子目录）
    image_dir = os.path.join('static', 'images')
    count = image_similarity.scan_directory(image_dir)
    
    # 如果数据库仍然为空，尝试其他方法添加图片
    if count == 0:
        logger.warning("数据库仍然为空，尝试直接添加测试图片...")
        test_images = [os.path.join(test_dir, f) for f in os.listdir(test_dir) 
                      if f.endswith(('.jpg', '.jpeg', '.png', '.gif'))]
        
        for path in test_images:
            logger.info(f"添加图片到数据库: {path}")
            image_similarity.add_to_database(path)
        
        logger.info(f"已添加 {len(test_images)} 张测试图片到数据库")
    else:
        logger.info(f"已从本地目录加载 {count} 张图片")


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/about')
def about():
    """关于页面"""
    return render_template('about.html')


@app.route('/help')
def help_page():
    """帮助页面"""
    return render_template('help.html')


@app.route('/stats')
def stats():
    """统计信息页面"""
    stats_data = {
        'database_size': len(image_similarity.image_database),
        'image_processed': get_processed_count(),
        'upload_today': get_uploads_today()
    }
    return render_template('stats.html', stats=stats_data)


@app.route('/gallery')
def gallery():
    """图库浏览页面"""
    # 准备图库数据
    images = []
    for img in image_similarity.image_database:
        images.append({
            'path': img['path'],
            'filename': img['filename']
        })
    return render_template('gallery.html', images=images)


@app.route('/contact')
def contact():
    """联系我们页面"""
    return render_template('contact.html')


@app.route('/search')
def search_by_image():
    """根据图片路径搜索相似图片"""
    image_path = request.args.get('image', '')
    if not image_path or not os.path.exists(image_path):
        flash('未找到指定图片')
        return redirect(url_for('index'))
        
    try:
        # 读取图像并搜索相似图片
        image = cv2.imread(image_path)
        if image is None:
            flash('无法读取指定图片')
            return redirect(url_for('index'))
        
        # 搜索相似图像
        similar_images = image_similarity.search(image)
        
        # 跟踪处理计数
        increment_processed_count()
        
        return render_template('results.html', 
                              query_image=image_path, 
                              similar_images=similar_images,
                              now=datetime.datetime.now())
    
    except Exception as e:
        flash(f'处理图像时出错: {str(e)}')
        return redirect(url_for('index'))


@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        flash('没有选择文件')
        return redirect(url_for('index'))
    
    file = request.files['file']
    if file.filename == '':
        flash('没有选择文件')
        return redirect(url_for('index'))
    
    try:
        # 保存上传的文件
        file_path = upload_handler.save_uploaded_file(file)
        
        # 读取图像并提取特征
        image = cv2.imread(file_path)
        if image is None:
            flash('无法读取上传的图像')
            return redirect(url_for('index'))
        
        # 搜索相似图像
        similar_images = image_similarity.search(image)
        
        # 将上传的图像也添加到数据库
        image_similarity.add_to_database(file_path)
        
        return render_template('results.html',
                              query_image=file_path,
                              similar_images=similar_images,
                              now=datetime.datetime.now())
    
    except Exception as e:
        flash(f'处理图像时出错: {str(e)}')
        return redirect(url_for('index'))


@app.route('/api/search', methods=['POST'])
def api_search():
    """API端点，用于AJAX请求"""
    if 'file' not in request.files:
        return jsonify({'error': '没有选择文件'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': '没有选择文件'}), 400
    
    if file and upload_handler.allowed_file(file.filename):
        try:
            # 读取图像数据
            img_data = file.read()
            nparr = np.frombuffer(img_data, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            # 搜索相似图像
            similar_images = image_similarity.search(image)
            
            # 准备响应数据
            results = []
            for img in similar_images:
                results.append({
                    'path': img['path'].replace('\\', '/'),
                    'similarity': round(img['similarity'], 2),
                    'filename': img['filename']
                })
            
            return jsonify({
                'success': True,
                'results': results
            })
        
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    return jsonify({'error': '不支持的文件类型'}), 400


@app.route('/api/stats')
def api_stats():
    """API端点，获取网站统计数据"""
    try:
        stats_data = {
            'database_size': len(image_similarity.image_database),
            'processed_count': get_processed_count(),
            'uploads_today': get_uploads_today()
        }
        return jsonify(stats_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# 创建一个上下文处理器，添加全局变量到所有模板
@app.context_processor
def inject_now():
    return {'now': datetime.datetime.now()}


if __name__ == '__main__':
    # 初始化图像数据库
    logger.info("初始化图像数据库...")
    init_image_database()
    
    # 输出数据库状态
    logger.info(f"数据库中共有 {len(image_similarity.image_database)} 张图片")
    if len(image_similarity.image_database) > 0:
        logger.info(f"数据库中的图片路径示例: {image_similarity.image_database[0]['path']}")
    
    # 启动应用
    logger.info("启动应用服务器...")
    app.run(debug=True, host='0.0.0.0', port=5000)
