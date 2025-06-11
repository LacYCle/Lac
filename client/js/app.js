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
        UserSettings.init();
        
        // 绑定全局事件
        bindGlobalEvents();
        
        
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
