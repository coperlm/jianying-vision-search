/**
 * 鉴影科技 - 图像相似度搜索
 * 前端交互JavaScript
 */

// 初始化应用
document.addEventListener('DOMContentLoaded', function() {
    initImageUploader();
    initSearchHistory();
    setupTooltips();
    setupImageLightbox();
});

/**
 * 初始化图片上传区域
 */
function initImageUploader() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    
    if (!dropZone || !fileInput) return;
    
    // 拖放功能
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('highlight');
    });
    
    ['dragleave', 'dragend'].forEach(type => {
        dropZone.addEventListener(type, (e) => {
            dropZone.classList.remove('highlight');
        });
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('highlight');
        
        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            updateThumbnail(dropZone, e.dataTransfer.files[0]);
        }
    });
    
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length) {
            updateThumbnail(dropZone, fileInput.files[0]);
        }
    });
}

/**
 * 更新缩略图预览
 */
function updateThumbnail(dropZone, file) {
    let thumbnailElement = dropZone.querySelector('.drop-zone-thumb');
    const searchButton = document.getElementById('searchButton');
    
    // 如果缩略图元素不存在，则创建
    if (!thumbnailElement) {
        thumbnailElement = document.createElement('div');
        thumbnailElement.classList.add('drop-zone-thumb');
        dropZone.appendChild(thumbnailElement);
    }
    
    // 显示缩略图元素
    thumbnailElement.classList.remove('hidden');
    
    // 隐藏提示文本
    const promptElement = dropZone.querySelector('.drop-zone-prompt');
    if (promptElement) {
        promptElement.classList.add('hidden');
    }
    
    // 确保文件是图像
    if (!file.type.startsWith('image/')) {
        thumbnailElement.style.backgroundImage = null;
        showErrorMessage('请上传有效的图像文件（JPG, PNG, GIF）');
        return;
    }
    
    // 启用搜索按钮
    if (searchButton) {
        searchButton.disabled = false;
    }
    
    // 创建缩略图
    const reader = new FileReader();
    reader.onload = () => {
        const img = document.createElement('img');
        img.src = reader.result;
        thumbnailElement.innerHTML = '';
        thumbnailElement.appendChild(img);
        
        // 添加删除按钮
        const removeBtn = document.createElement('button');
        removeBtn.className = 'absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 focus:outline-none';
        removeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>';
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            resetUploadArea(dropZone);
            if (fileInput) fileInput.value = '';
            if (searchButton) searchButton.disabled = true;
        });
        thumbnailElement.appendChild(removeBtn);
    };
    reader.readAsDataURL(file);
}

/**
 * 重置上传区域
 */
function resetUploadArea(dropZone) {
    const thumbnailElement = dropZone.querySelector('.drop-zone-thumb');
    const promptElement = dropZone.querySelector('.drop-zone-prompt');
    
    if (thumbnailElement) {
        thumbnailElement.classList.add('hidden');
        thumbnailElement.innerHTML = '';
    }
    
    if (promptElement) {
        promptElement.classList.remove('hidden');
    }
}

/**
 * 显示错误消息
 */
function showErrorMessage(message, duration = 3000) {
    const alertContainer = document.getElementById('alertContainer');
    
    if (!alertContainer) {
        const container = document.createElement('div');
        container.id = 'alertContainer';
        container.className = 'fixed top-5 right-5 z-50';
        document.body.appendChild(container);
    }
    
    const alert = document.createElement('div');
    alert.className = 'bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-3 shadow-md transform transition-all duration-300 opacity-0 translate-x-full';
    alert.innerHTML = `
        <div class="flex items-center">
            <svg class="h-5 w-5 mr-2 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            <p class="font-medium">${message}</p>
            <button class="ml-auto hover:text-red-900 focus:outline-none" onclick="this.parentNode.parentNode.remove()">
                <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
            </button>
        </div>
    `;
    
    document.getElementById('alertContainer').appendChild(alert);
    
    // 动画显示
    setTimeout(() => {
        alert.classList.remove('opacity-0', 'translate-x-full');
    }, 10);
    
    // 自动关闭
    if (duration > 0) {
        setTimeout(() => {
            alert.classList.add('opacity-0', 'translate-x-full');
            setTimeout(() => {
                alert.remove();
            }, 300);
        }, duration);
    }
}

/**
 * 初始化搜索历史
 */
function initSearchHistory() {
    // 从localStorage加载搜索历史
    const searchHistory = document.getElementById('searchHistory');
    if (!searchHistory) return;
    
    try {
        const history = JSON.parse(localStorage.getItem('searchHistory')) || [];
        if (history.length > 0) {
            searchHistory.classList.remove('hidden');
            const historyList = searchHistory.querySelector('.history-list');
            if (historyList) {
                historyList.innerHTML = '';
                
                history.slice(0, 5).forEach(item => {
                    const historyItem = document.createElement('div');
                    historyItem.className = 'bg-white rounded-lg shadow-sm p-3 flex items-center hover:shadow-md transition-shadow';
                    historyItem.innerHTML = `
                        <img src="${item.thumbnailUrl}" alt="搜索缩略图" class="w-16 h-16 object-cover rounded mr-3">
                        <div class="flex-1">
                            <p class="text-sm text-gray-500">搜索于: ${formatDate(item.timestamp)}</p>
                            <p class="text-xs text-gray-400 mt-1">找到 ${item.resultCount} 个相似结果</p>
                        </div>
                        <button class="text-blue-600 hover:text-blue-800 text-sm" data-thumbnail="${item.thumbnailUrl}">
                            重新搜索
                        </button>
                    `;
                    historyList.appendChild(historyItem);
                });
            }
        }
    } catch (error) {
        console.error('加载搜索历史失败:', error);
    }
}

/**
 * 保存搜索历史到localStorage
 */
function saveToSearchHistory(thumbnailUrl, resultCount) {
    try {
        const history = JSON.parse(localStorage.getItem('searchHistory')) || [];
        history.unshift({
            thumbnailUrl,
            timestamp: Date.now(),
            resultCount
        });
        
        // 只保留最近10条记录
        localStorage.setItem('searchHistory', JSON.stringify(history.slice(0, 10)));
    } catch (error) {
        console.error('保存搜索历史失败:', error);
    }
}

/**
 * 格式化日期
 */
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString().slice(0, 5)}`;
}

/**
 * 初始化工具提示
 */
function setupTooltips() {
    const tooltipTriggers = document.querySelectorAll('[data-tooltip]');
    
    tooltipTriggers.forEach(trigger => {
        const tooltipText = trigger.dataset.tooltip;
        let tooltip = null;
        
        trigger.addEventListener('mouseenter', () => {
            tooltip = document.createElement('div');
            tooltip.className = 'absolute z-50 bg-gray-800 text-white text-xs rounded px-2 py-1 max-w-xs backdrop-blur';
            tooltip.innerHTML = tooltipText;
            document.body.appendChild(tooltip);
            
            // 定位工具提示
            const rect = trigger.getBoundingClientRect();
            tooltip.style.top = `${rect.top - tooltip.offsetHeight - 5 + window.scrollY}px`;
            tooltip.style.left = `${rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + window.scrollX}px`;
            
            // 动画显示
            tooltip.style.opacity = '0';
            tooltip.style.transform = 'translateY(10px)';
            tooltip.style.transition = 'opacity 0.2s, transform 0.2s';
            
            setTimeout(() => {
                tooltip.style.opacity = '1';
                tooltip.style.transform = 'translateY(0)';
            }, 10);
        });
        
        trigger.addEventListener('mouseleave', () => {
            if (tooltip) {
                tooltip.style.opacity = '0';
                tooltip.style.transform = 'translateY(10px)';
                setTimeout(() => {
                    tooltip.remove();
                }, 200);
            }
        });
    });
}

/**
 * 设置图像灯箱效果
 */
function setupImageLightbox() {
    document.addEventListener('click', (e) => {
        const target = e.target;
        
        // 检查是否点击了结果图片
        if (target.tagName === 'IMG' && target.closest('.image-card')) {
            e.preventDefault();
            const imageUrl = target.src;
            createLightbox(imageUrl);
        }
    });
}

/**
 * 创建图像灯箱
 */
function createLightbox(imageUrl) {
    const lightbox = document.createElement('div');
    lightbox.className = 'fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50';
    lightbox.style.opacity = '0';
    lightbox.style.transition = 'opacity 0.3s';
    
    lightbox.innerHTML = `
        <button class="absolute top-4 right-4 text-white hover:text-gray-300 focus:outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
        <div class="relative">
            <img src="${imageUrl}" alt="放大图片" class="max-w-[90vw] max-h-[90vh] object-contain">
        </div>
    `;
    
    document.body.appendChild(lightbox);
    document.body.style.overflow = 'hidden';
    
    // 淡入效果
    setTimeout(() => {
        lightbox.style.opacity = '1';
    }, 10);
    
    // 关闭按钮事件
    lightbox.querySelector('button').addEventListener('click', () => {
        lightbox.style.opacity = '0';
        setTimeout(() => {
            lightbox.remove();
            document.body.style.overflow = '';
        }, 300);
    });
    
    // 点击背景关闭
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.style.opacity = '0';
            setTimeout(() => {
                lightbox.remove();
                document.body.style.overflow = '';
            }, 300);
        }
    });
}
