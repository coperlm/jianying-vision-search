# 鉴影科技图像相似度检测系统

一个基于Python和Tailwind CSS的图像相似度检测Web应用，可以上传图片并在全网范围内搜索相似图像。

## 功能特点

- 上传图片并查找相似图像
- 显示相似度百分比
- 响应式设计，适配各种设备
- 直观的用户界面
- 拖放文件上传
- 支持常见图像格式 (JPG, PNG, GIF)

## 技术栈

- **后端**: Python, Flask
- **前端**: HTML, CSS, JavaScript, Tailwind CSS
- **图像处理**: OpenCV, Pillow, NumPy
- **相似度算法**: 基于颜色直方图、边缘特征和纹理特征

## 安装说明

### 先决条件

- Python 3.7+
- pip包管理器

### 手动安装

1. 打开命令提示符，进入项目目录
   ```
   git clone https://github.com/coperlm/jianying-vision-search.git
   cd ./jianying-vision-search
   ```
2. 安装依赖：
   ```
   pip install -r requirements.txt
   ```
3. 运行应用：
   ```
   python main.py
   ```
4. 打开浏览器访问: http://localhost:5000

## 项目结构

```
相似度检测/
│
├── static/                 # 静态资源
│   ├── css/                # CSS样式表
│   ├── js/                 # JavaScript文件
│   ├── images/             # 示例图片和资源
│   └── uploads/            # 用户上传的图片
│
├── templates/              # HTML模板
│   ├── base.html           # 基础模板
│   ├── index.html          # 首页模板
│   └── results.html        # 结果页模板
│
├── app.py                  # Flask应用(旧版)
├── main.py                 # 主程序入口
├── image_similarity.py     # 图像相似度处理模块
├── upload_handler.py       # 文件上传处理模块
├── web_crawler.py          # 网络图像爬取模块
├── requirements.txt        # 依赖库列表
├── start.bat               # Windows启动脚本
└── README.md               # 项目说明
```

## 相似度算法说明

本项目使用了多种图像特征进行相似度计算：

1. **颜色直方图特征**：分析图像的颜色分布
2. **边缘特征**：使用Canny边缘检测提取边缘信息
3. **纹理特征**：使用局部二值模式(LBP)分析纹理

相似度计算基于特征向量间的余弦相似度，结果转换为百分比形式。

## 注意事项

- 本项目仅为演示目的，"全网搜索"功能使用了模拟数据
- 实际部署时应考虑性能优化和安全措施
- 大文件上传可能需要调整服务器配置

## 未来改进计划

- 添加更高级的特征提取算法
- 集成真实的图像搜索API
- 添加用户认证系统
- 支持更多图像格式
- 优化移动端体验

## 许可证

本项目采用MIT许可证
