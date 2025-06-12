/**
 * 鉴影科技 - 图表工具函数
 * 提供数据可视化的辅助功能
 */

/**
 * 生成渐变色背景
 * @param {CanvasRenderingContext2D} ctx - Canvas上下文
 * @param {string} startColor - 起始颜色
 * @param {string} endColor - 结束颜色
 * @returns {CanvasGradient}
 */
function createGradient(ctx, startColor, endColor) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, startColor);
    gradient.addColorStop(1, endColor);
    return gradient;
}

/**
 * 生成随机数据
 * @param {number} count - 数据点数量
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {Array}
 */
function generateRandomData(count, min, max) {
    return Array.from({ length: count }, () => 
        Math.floor(Math.random() * (max - min + 1)) + min
    );
}

/**
 * 生成日期标签
 * @param {number} days - 天数
 * @param {string} format - 'day'日期格式，'week'周格式，'month'月份格式
 * @returns {Array}
 */
function generateDateLabels(days, format = 'day') {
    const labels = [];
    const today = new Date();
    
    switch(format) {
        case 'day':
            // 日期标签 - 过去N天，格式：10/24
            for (let i = days - 1; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(today.getDate() - i);
                labels.push(`${date.getMonth() + 1}/${date.getDate()}`);
            }
            break;
            
        case 'week':
            // 周标签 - 过去N周，格式：第X周
            for (let i = days - 1; i >= 0; i--) {
                labels.push(`第${days - i}周`);
            }
            break;
            
        case 'month':
            // 月份标签 - 过去N月，格式：YYYY年M月
            for (let i = days - 1; i >= 0; i--) {
                const date = new Date(today);
                date.setMonth(today.getMonth() - i);
                labels.push(`${date.getFullYear()}年${date.getMonth() + 1}月`);
            }
            break;
    }
    
    return labels;
}

/**
 * 格式化大数字
 * @param {number} num - 数字
 * @returns {string}
 */
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

/**
 * 创建柱状图配置
 * @param {string} label - 数据标签
 * @param {Array} data - 数据数组
 * @param {string} backgroundColor - 背景颜色
 * @param {string} borderColor - 边框颜色
 * @returns {Object} - 图表配置对象
 */
function createBarChartConfig(label, data, backgroundColor, borderColor) {
    return {
        type: 'bar',
        data: {
            datasets: [{
                label: label,
                data: data,
                backgroundColor: backgroundColor,
                borderColor: borderColor,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        drawBorder: false,
                        color: 'rgba(200, 200, 200, 0.15)'
                    },
                    ticks: {
                        callback: function(value) {
                            return formatNumber(value);
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.raw}`;
                        }
                    }
                }
            }
        }
    };
}

/**
 * 创建线图配置
 * @param {string} label - 数据标签
 * @param {Array} data - 数据数组
 * @param {string} lineColor - 线条颜色
 * @param {string} fillStartColor - 填充区域渐变起始颜色
 * @param {string} fillEndColor - 填充区域渐变结束颜色
 * @returns {Object} - 图表配置对象
 */
function createLineChartConfig(label, data, lineColor, fillStartColor, fillEndColor) {
    return {
        type: 'line',
        data: {
            datasets: [{
                label: label,
                data: data,
                borderColor: lineColor,
                borderWidth: 2,
                pointBackgroundColor: lineColor,
                pointRadius: 3,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        drawBorder: false,
                        color: 'rgba(200, 200, 200, 0.15)'
                    },
                    ticks: {
                        callback: function(value) {
                            return formatNumber(value);
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    };
}

// 导出工具函数
window.chartUtils = {
    createGradient,
    generateRandomData,
    generateDateLabels,
    formatNumber,
    createBarChartConfig,
    createLineChartConfig
};
