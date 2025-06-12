/**
 * 鉴影科技 - 应用核心JS
 * 为整个网站提供统一的交互和功能支持
 */

// 全局配置
const APP_CONFIG = {
    apiEndpoint: '/api',
    maxUploadSize: 16 * 1024 * 1024, // 16MB
    supportedFormats: ['image/jpeg', 'image/png', 'image/gif'],
    animationDuration: 300
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 全局初始化
    initializeNavigation();
    initializeNotifications();
    setupDarkModeToggle();
    setupAnimations();
    
    // 页面特定初始化
    const currentPage = getCurrentPage();
    switch(currentPage) {
        case 'index':
            initializeHomePage();
            break;
        case 'gallery':
            initializeGalleryPage();
            break;
        case 'results':
            initializeResultsPage();
            break;
        case 'stats':
            initializeStatsPage();
            break;
        case 'about':
        case 'help':
        case 'contact':
            initializeStaticPage();
            break;
    }
});

/**
 * 获取当前页面标识
 */
function getCurrentPage() {
    const path = window.location.pathname;
    if (path === '/') return 'index';
    return path.split('/')[1] || 'index';
}

/**
 * 初始化导航交互
 */
function initializeNavigation() {
    // 当前页面导航高亮
    const path = window.location.pathname;
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (path === href) {
            link.classList.add('text-blue-200', 'font-medium');
        }
    });
    
    // 移动端菜单
    const mobileMenuButton = document.getElementById('mobileMenuButton');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            
            // 动画效果
            if (!mobileMenu.classList.contains('hidden')) {
                mobileMenu.style.opacity = '0';
                mobileMenu.style.transform = 'translateY(-10px)';
                setTimeout(() => {
                    mobileMenu.style.opacity = '1';
                    mobileMenu.style.transform = 'translateY(0)';
                }, 10);
            }
        });
    }
}

/**
 * 初始化通知系统
 */
function initializeNotifications() {
    // 创建通知容器
    if (!document.getElementById('notificationContainer')) {
        const container = document.createElement('div');
        container.id = 'notificationContainer';
        container.className = 'fixed top-5 right-5 z-50 flex flex-col items-end space-y-2';
        document.body.appendChild(container);
    }
    
    // 检查URL参数是否包含消息
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');
    const type = urlParams.get('type') || 'info';
    
    if (message) {
        showNotification(message, type);
    }
}

/**
 * 显示通知消息
 * @param {string} message - 消息内容
 * @param {string} type - 消息类型: success, error, info, warning
 * @param {number} duration - 显示时长(ms)，0表示不自动关闭
 */
function showNotification(message, type = 'info', duration = 5000) {
    const container = document.getElementById('notificationContainer');
    if (!container) return;
    
    // 通知样式配置
    const styles = {
        success: {
            bg: 'bg-green-100',
            border: 'border-green-500',
            text: 'text-green-700',
            icon: '<svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>'
        },
        error: {
            bg: 'bg-red-100',
            border: 'border-red-500',
            text: 'text-red-700',
            icon: '<svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>'
        },
        info: {
            bg: 'bg-blue-100',
            border: 'border-blue-500',
            text: 'text-blue-700',
            icon: '<svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>'
        },
        warning: {
            bg: 'bg-yellow-100',
            border: 'border-yellow-500',
            text: 'text-yellow-700',
            icon: '<svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>'
        }
    };
    
    const style = styles[type] || styles.info;
    
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `flex items-center ${style.bg} ${style.text} border-l-4 ${style.border} py-2 px-4 rounded-md shadow-md transform transition-all duration-300 opacity-0 translate-x-full max-w-md`;
    notification.innerHTML = `
        <div class="flex items-center">
            ${style.icon}
            <p>${message}</p>
        </div>
        <button class="ml-4 focus:outline-none hover:text-gray-600" aria-label="关闭">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
    `;
    
    // 添加到DOM
    container.appendChild(notification);
    
    // 点击关闭事件
    notification.querySelector('button').addEventListener('click', () => {
        closeNotification(notification);
    });
    
    // 动画显示
    requestAnimationFrame(() => {
        notification.classList.remove('opacity-0', 'translate-x-full');
    });
    
    // 自动关闭
    if (duration > 0) {
        setTimeout(() => {
            closeNotification(notification);
        }, duration);
    }
    
    return notification;
}

/**
 * 关闭通知
 */
function closeNotification(notification) {
    notification.classList.add('opacity-0', 'translate-x-full');
    setTimeout(() => {
        notification.remove();
    }, APP_CONFIG.animationDuration);
}

/**
 * 初始化首页功能
 */
function initializeHomePage() {
    // 这里复用现有的main.js中的功能
    // 可以调用现有的initImageUploader等函数
    
    // 添加最近搜索结果加载
    loadRecentSearches();
    
    // 动态统计数据
    loadStatistics();
}

/**
 * 初始化图库页面
 */
function initializeGalleryPage() {
    // 图片延迟加载
    setupLazyLoading();
    
    // 图片过滤和排序
    setupImageFilters();
    
    // 缩略图点击放大功能
    setupImagePreviews();
}

/**
 * 初始化结果页面
 */
function initializeResultsPage() {
    // 结果高亮动画
    animateResults();
    
    // 相似度评分可视化
    initializeSimilarityMeters();
    
    // 结果图片延迟加载
    setupLazyLoading();
}

/**
 * 初始化统计页面
 */
function initializeStatsPage() {
    // 使用Chart.js绘制统计图表
    if (typeof Chart !== 'undefined') {
        // 加载统计数据并渲染图表
        fetch('/api/stats')
            .then(response => response.json())
            .then(data => {
                renderStatCharts(data);
                updateStatCards(data);
            })
            .catch(error => {
                console.error("加载统计数据失败", error);
                showNotification("无法加载统计数据，请稍后再试", "error");
            });
    } else {
        console.warn('Chart.js库未加载，无法渲染图表');
        showNotification("图表库加载失败，请刷新页面重试", "warning");
    }

    // 设置图表时间范围切换
    setupChartPeriodSwitcher();
}

/**
 * 渲染统计页面图表
 * @param {Object} data - 从API获取的统计数据
 */
function renderStatCharts(data) {
    // 渲染数据趋势图表
    renderTrendsChart('day');
    
    // 渲染其他可能的图表
    // ...
}

/**
 * 更新统计卡片数据
 * @param {Object} data - 从API获取的统计数据
 */
function updateStatCards(data) {
    // 更新数据库规模卡片
    const dbSizeElement = document.querySelector('.stats-card .text-4xl');
    if (dbSizeElement && data.database_size) {
        dbSizeElement.textContent = data.database_size;
    }
    
    // 更新已处理图像卡片
    const processedElement = document.querySelector('.bg-gradient-to-br.from-indigo-500 .text-4xl');
    if (processedElement && data.processed_count) {
        processedElement.textContent = data.processed_count;
    }
    
    // 更新今日上传卡片
    const todayElement = document.querySelector('.bg-gradient-to-br.from-purple-500 .text-4xl');
    if (todayElement && data.uploads_today) {
        todayElement.textContent = data.uploads_today;
    }
}

/**
 * 设置图表时间范围切换按钮
 */
function setupChartPeriodSwitcher() {
    const dayButton = document.getElementById('chartDayBtn');
    const weekButton = document.getElementById('chartWeekBtn');
    const monthButton = document.getElementById('chartMonthBtn');
    
    if (!dayButton || !weekButton || !monthButton) return;
    
    const buttons = [dayButton, weekButton, monthButton];
    const periods = ['day', 'week', 'month'];
    
    buttons.forEach((button, index) => {
        button.addEventListener('click', () => {
            // 更新按钮状态
            buttons.forEach(btn => {
                btn.classList.remove('bg-blue-600', 'text-white');
                btn.classList.add('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
            });
            button.classList.remove('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
            button.classList.add('bg-blue-600', 'text-white');
            
            // 渲染对应时间范围的图表
            renderTrendsChart(periods[index]);
        });
    });
}

/**
 * 渲染数据趋势图表
 * @param {string} period - 时间周期：'day', 'week', 'month'
 */
function renderTrendsChart(period = 'day') {
    const chartCanvas = document.getElementById('trendsChart');
    if (!chartCanvas) return;
    
    // 销毁现有图表
    if (window.trendsChart) {
        window.trendsChart.destroy();
    }
    
    // 设置不同时间周期的数据点数量和标签
    let dataPoints, labels;
    switch(period) {
        case 'day':
            dataPoints = 7; // 一周
            labels = chartUtils.generateDateLabels(dataPoints, 'day');
            break;
        case 'week':
            dataPoints = 8; // 2个月
            labels = chartUtils.generateDateLabels(dataPoints, 'week');
            break;
        case 'month':
            dataPoints = 12; // 一年
            labels = chartUtils.generateDateLabels(dataPoints, 'month');
            break;
        default:
            dataPoints = 7;
            labels = chartUtils.generateDateLabels(dataPoints, 'day');
    }
    
    // 生成模拟数据
    const uploadsData = chartUtils.generateRandomData(dataPoints, 50, 200);
    const queriesData = chartUtils.generateRandomData(dataPoints, 100, 500);
    
    // 创建图表
    const ctx = chartCanvas.getContext('2d');
    
    // 创建图表数据
    const chartData = {
        labels: labels,
        datasets: [
            {
                label: '上传图片',
                data: uploadsData,
                borderColor: '#4F46E5',
                backgroundColor: function(context) {
                    const chart = context.chart;
                    const {ctx, chartArea} = chart;
                    if (!chartArea) return null;
                    
                    // 创建渐变填充
                    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                    gradient.addColorStop(0, 'rgba(79, 70, 229, 0.0)');
                    gradient.addColorStop(1, 'rgba(79, 70, 229, 0.3)');
                    return gradient;
                },
                borderWidth: 2,
                pointBackgroundColor: '#4F46E5',
                pointRadius: 3,
                tension: 0.4,
                fill: true
            },
            {
                label: '查询次数',
                data: queriesData,
                borderColor: '#06B6D4',
                backgroundColor: function(context) {
                    const chart = context.chart;
                    const {ctx, chartArea} = chart;
                    if (!chartArea) return null;
                    
                    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                    gradient.addColorStop(0, 'rgba(6, 182, 212, 0.0)');
                    gradient.addColorStop(1, 'rgba(6, 182, 212, 0.3)');
                    return gradient;
                },
                borderWidth: 2,
                pointBackgroundColor: '#06B6D4',
                pointRadius: 3,
                tension: 0.4,
                fill: true
            }
        ]
    };
    
    // 图表配置
    const config = {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        drawBorder: false,
                        color: function(context) {
                            if (document.documentElement.classList.contains('dark')) {
                                return 'rgba(255, 255, 255, 0.1)';
                            }
                            return 'rgba(0, 0, 0, 0.1)';
                        }
                    },
                    ticks: {
                        color: function(context) {
                            if (document.documentElement.classList.contains('dark')) {
                                return 'rgba(255, 255, 255, 0.7)';
                            }
                            return 'rgba(0, 0, 0, 0.7)';
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: function(context) {
                            if (document.documentElement.classList.contains('dark')) {
                                return 'rgba(255, 255, 255, 0.7)';
                            }
                            return 'rgba(0, 0, 0, 0.7)';
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: function(context) {
                            if (document.documentElement.classList.contains('dark')) {
                                return 'rgba(255, 255, 255, 0.9)';
                            }
                            return 'rgba(0, 0, 0, 0.9)';
                        },
                        boxWidth: 12,
                        padding: 15
                    }
                },
                tooltip: {
                    backgroundColor: function(context) {
                        if (document.documentElement.classList.contains('dark')) {
                            return 'rgba(26, 32, 44, 0.95)';
                        }
                        return 'rgba(255, 255, 255, 0.95)';
                    },
                    titleColor: function(context) {
                        if (document.documentElement.classList.contains('dark')) {
                            return 'rgba(255, 255, 255, 0.9)';
                        }
                        return 'rgba(0, 0, 0, 0.9)';
                    },
                    bodyColor: function(context) {
                        if (document.documentElement.classList.contains('dark')) {
                            return 'rgba(255, 255, 255, 0.7)';
                        }
                        return 'rgba(0, 0, 0, 0.7)';
                    },
                    padding: 10,
                    borderColor: function(context) {
                        if (document.documentElement.classList.contains('dark')) {
                            return 'rgba(255, 255, 255, 0.1)';
                        }
                        return 'rgba(0, 0, 0, 0.1)';
                    },
                    borderWidth: 1
                }
            }
        }
    };
    
    // 创建图表
    window.trendsChart = new Chart(ctx, config);
}

// 辅助功能函数
function setupLazyLoading() {
    // 图片懒加载实现
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => imageObserver.observe(img));
    } else {
        // 降级处理
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    }
}

/**
 * 加载最近搜索记录
 */
function loadRecentSearches() {
    const searchHistoryContainer = document.getElementById('recentSearches');
    if (!searchHistoryContainer) return;
    
    try {
        const history = JSON.parse(localStorage.getItem('searchHistory')) || [];
        
        if (history.length > 0) {
            const historyItems = history.slice(0, 3).map(item => `
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-3 hover-scale">
                    <div class="flex items-center">
                        <img src="${item.thumbnailUrl}" alt="搜索缩略图" 
                             class="w-16 h-16 object-cover rounded mr-3">
                        <div>
                            <p class="text-sm text-gray-500 dark:text-gray-300">
                                ${new Date(item.timestamp).toLocaleString()}
                            </p>
                            <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                找到 ${item.resultCount} 个相似结果
                            </p>
                            <button class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm mt-1" 
                                    data-search-again="${item.thumbnailUrl}">
                                重新搜索
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
            
            searchHistoryContainer.innerHTML = `
                <h3 class="text-xl font-bold mb-4">最近搜索</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    ${historyItems}
                </div>
            `;
            
            // 添加重新搜索事件
            document.querySelectorAll('[data-search-again]').forEach(button => {
                button.addEventListener('click', () => {
                    // TODO: 实现重新搜索
                    console.log("重新搜索：", button.dataset.searchAgain);
                });
            });
        }
    } catch (error) {
        console.error("加载搜索历史失败", error);
    }
}

/**
 * 加载统计数据
 */
function loadStatistics() {
    const statsContainer = document.getElementById('quickStats');
    if (!statsContainer) return;
    
    // 可以从后端API获取，这里使用模拟数据
    fetch('/api/stats')
        .then(response => response.json())
        .then(data => {
            statsContainer.innerHTML = `
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                    <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6 text-center">
                        <h3 class="text-xl font-bold mb-2">数据库图片</h3>
                        <p class="text-3xl font-bold">${data.database_size || '加载中...'}</p>
                    </div>
                    <div class="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-lg p-6 text-center">
                        <h3 class="text-xl font-bold mb-2">已处理请求</h3>
                        <p class="text-3xl font-bold">${data.processed_count || '加载中...'}</p>
                    </div>
                    <div class="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-lg p-6 text-center">
                        <h3 class="text-xl font-bold mb-2">今日上传</h3>
                        <p class="text-3xl font-bold">${data.uploads_today || '加载中...'}</p>
                    </div>
                </div>
            `;
        })
        .catch(error => {
            console.error("加载统计数据失败", error);
            statsContainer.innerHTML = `
                <div class="text-center text-red-500 p-4">
                    加载统计数据失败，请稍后再试
                </div>
            `;
        });
}
