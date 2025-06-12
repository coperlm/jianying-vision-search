"""
上传图片的处理模块
"""
import os
import uuid
import cv2
import numpy as np
from flask import current_app
from werkzeug.utils import secure_filename

class UploadHandler:
    def __init__(self, app_config):
        self.upload_folder = app_config['UPLOAD_FOLDER']
        self.allowed_extensions = app_config['ALLOWED_EXTENSIONS']
        self.max_content_length = app_config.get('MAX_CONTENT_LENGTH', 16 * 1024 * 1024)
        
        # 确保上传目录存在
        os.makedirs(self.upload_folder, exist_ok=True)
    
    def allowed_file(self, filename):
        """检查文件是否是允许的扩展名"""
        return '.' in filename and filename.rsplit('.', 1)[1].lower() in self.allowed_extensions
    
    def get_unique_filename(self, filename):
        """生成唯一的文件名，避免文件覆盖"""
        secured_filename = secure_filename(filename)
        unique_filename = f"{uuid.uuid4()}_{secured_filename}"
        return unique_filename
    
    def save_uploaded_file(self, file_obj):
        """保存上传的文件并返回路径"""
        if not file_obj or file_obj.filename == '':
            raise ValueError("没有选择文件")
        
        if not self.allowed_file(file_obj.filename):
            raise ValueError("不支持的文件类型")
        
        filename = self.get_unique_filename(file_obj.filename)
        file_path = os.path.join(self.upload_folder, filename)
        
        file_obj.save(file_path)
        return file_path
    
    def process_file_data(self, file_data):
        """处理文件数据并返回图像对象"""
        nparr = np.frombuffer(file_data, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise ValueError("无法解析图像数据")
        
        return image
