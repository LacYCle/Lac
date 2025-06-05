/**
 * Courser - 在线网课学习平台
 * 主应用程序文件
 */

// 日志记录模块
const Logger = {
    info: function(message) {
        console.log(`[INFO] ${new Date().toLocaleString()}: ${message}`);
    },
    error: function(message, error) {
        console.error(`[ERROR] ${new Date().toLocaleString()}: ${message}`, error);
    },
    warn: function(message) {
        console.warn(`[WARN] ${new Date().toLocaleString()}: ${message}`);
    }
};

// 全局错误处理
window.onerror = function(message, source, lineno, colno, error) {
    Logger.error(`全局错误: ${message}`, error);
    return false;
};

// 应用程序配置
const AppConfig = {
    defaultVideoQuality: '720',
    defaultPlaybackSpeed: '1.0',
    defaultVolume: 80,
    autoplay: true,
    theme: 'light',
    apiBaseUrl: 'https://api.courser.com' // 假设的API地址
};

// 应用程序初始化
document.addEventListener('DOMContentLoaded', function() {
    Logger.info('应用程序初始化开始');
    
    try {
        // 初始化各个模块
        UserAuth.init();
        CourseManager.init();
        VideoPlayer.init();
        UserSettings.init();
        
        // 绑定全局事件
        bindGlobalEvents();
        
        // 加载示例数据
        loadDemoData();
        
        Logger.info('应用程序初始化完成');
    } catch (error) {
        Logger.error('应用程序初始化失败', error);
        showErrorMessage('应用程序加载失败，请刷新页面重试');
    }
});

// 绑定全局事件
function bindGlobalEvents() {
    // 搜索功能
    document.getElementById('searchButton').addEventListener('click', function() {
        const searchTerm = document.getElementById('searchInput').value.trim();
        if (searchTerm) {
            CourseManager.searchCourses(searchTerm);
        }
    });
    
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('searchButton').click();
        }
    });
    
    // 主题切换
    const themeToggle = document.querySelectorAll('input[name="theme"]');
    themeToggle.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked) {
                UserSettings.setTheme(this.value);
            }
        });
    });
}

// 显示错误消息
function showErrorMessage(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show fixed-top m-3';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="close" data-dismiss="alert">
            <span>&times;</span>
        </button>
    `;
    document.body.appendChild(alertDiv);
    
    // 5秒后自动关闭
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => alertDiv.remove(), 500);
    }, 5000);
}

// 加载示例数据
function loadDemoData() {
    // 模拟课程数据
    const demoCourses = [
        {
            id: 1,
            title: '前端开发入门到精通',
            description: '从零开始学习HTML、CSS和JavaScript，成为前端开发工程师。',
            thumbnail: 'https://via.placeholder.com/300x180?text=前端开发',
            duration: '10小时30分钟',
            instructor: '张教授',
            category: '编程',
            isFavorite: false,
            isWatched: false,
            videoUrl: 'https://example.com/videos/frontend.mp4'
        },
        {
            id: 2,
            title: 'Python数据分析实战',
            description: '学习使用Python进行数据分析，包括NumPy、Pandas和Matplotlib等库的使用。',
            thumbnail: 'https://via.placeholder.com/300x180?text=Python数据分析',
            duration: '8小时45分钟',
            instructor: '李博士',
            category: '数据科学',
            isFavorite: true,
            isWatched: false,
            videoUrl: 'https://example.com/videos/python-data.mp4'
        },
        {
            id: 3,
            title: '机器学习基础',
            description: '了解机器学习的基本概念和算法，包括监督学习和无监督学习。',
            thumbnail: 'https://via.placeholder.com/300x180?text=机器学习',
            duration: '12小时15分钟',
            instructor: '王教授',
            category: '人工智能',
            isFavorite: false,
            isWatched: true,
            videoUrl: 'https://example.com/videos/machine-learning.mp4'
        },
        {
            id: 4,
            title: 'Java编程从入门到精通',
            description: '全面学习Java编程语言，从基础语法到高级特性。',
            thumbnail: 'https://via.placeholder.com/300x180?text=Java编程',
            duration: '15小时20分钟',
            instructor: '刘老师',
            category: '编程',
            isFavorite: false,
            isWatched: false,
            videoUrl: 'https://example.com/videos/java.mp4'
        },
        {
            id: 5,
            title: '数据库设计与优化',
            description: '学习关系型数据库的设计原则和性能优化技巧。',
            thumbnail: 'https://via.placeholder.com/300x180?text=数据库',
            duration: '7小时50分钟',
            instructor: '陈工程师',
            category: '数据库',
            isFavorite: true,
            isWatched: true,
            videoUrl: 'https://example.com/videos/database.mp4'
        },
        {
            id: 6,
            title: 'Web安全实战',
            description: '了解常见的Web安全漏洞和防护措施。',
            thumbnail: 'https://via.placeholder.com/300x180?text=Web安全',
            duration: '6小时40分钟',
            instructor: '赵专家',
            category: '网络安全',
            isFavorite: false,
            isWatched: false,
            videoUrl: 'https://example.com/videos/web-security.mp4'
        }
    ];
    
    // 将示例数据存储到本地存储
    localStorage.setItem('demoCourses', JSON.stringify(demoCourses));
    
    // 渲染课程列表
    CourseManager.renderCourses(demoCourses);
}