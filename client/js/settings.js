/**
 * Courser - 在线网课学习平台
 * 用户设置模块
 */

const UserSettings = {
    // 用户设置数据
    settings: {
        
        // 界面设置
        theme: 'light',
        fontSize: 'medium',
        notifications: true
    },
    
    // 初始化设置模块
    init: function() {
        Logger.info('初始化用户设置模块');
        
        // 从本地存储加载设置
        this.loadSettings();
        
        // 绑定设置相关事件
        this.bindEvents();
        
        // 应用当前设置
        this.applySettings();
    },
    
    // 从本地存储加载设置
    loadSettings: function() {
        try {
            const savedSettings = localStorage.getItem('userSettings');
            if (savedSettings) {
                // 合并保存的设置和默认设置
                const parsedSettings = JSON.parse(savedSettings);
                this.settings = { ...this.settings, ...parsedSettings };
                Logger.info('用户设置加载成功');
            } else {
                // 使用默认设置
                this.settings.defaultQuality = AppConfig.defaultVideoQuality;
                this.settings.defaultSpeed = AppConfig.defaultPlaybackSpeed;
                this.settings.volumeLevel = AppConfig.defaultVolume;
                this.settings.autoplay = AppConfig.autoplay;
                this.settings.theme = AppConfig.theme;
                Logger.info('使用默认设置');
            }
        } catch (error) {
            Logger.error('加载用户设置失败', error);
            // 出错时使用默认设置
            this.settings.defaultQuality = AppConfig.defaultVideoQuality;
            this.settings.defaultSpeed = AppConfig.defaultPlaybackSpeed;
            this.settings.volumeLevel = AppConfig.defaultVolume;
            this.settings.autoplay = AppConfig.autoplay;
            this.settings.theme = AppConfig.theme;
        }
    },
    
    // 保存设置到本地存储
    saveSettings: function() {
        try {
            localStorage.setItem('userSettings', JSON.stringify(this.settings));
            Logger.info('用户设置已保存');
        } catch (error) {
            Logger.error('保存用户设置失败', error);
            showErrorMessage('保存设置失败，请稍后重试');
        }
    },
    
    // 绑定设置相关事件
    bindEvents: function() {
        // 设置按钮点击事件
        document.getElementById('settingsButton').addEventListener('click', (e) => {
            e.preventDefault(); // 阻止默认行为
            $('#settingsModal').modal('show');
        });
        
        // 保存设置按钮点击事件
        document.getElementById('saveSettings').addEventListener('click', () => {
            const selectedColor = document.querySelector('input[name="themeColor"]:checked').value;
            this.settings.themeColor = selectedColor;
            this.saveSettings();
            this.applyThemeColor();
            $('#settingsModal').modal('hide');
            showSuccessMessage('设置已保存');
        });
    },
    
    // 应用主题颜色
    applyThemeColor: function() {
        const color = this.settings.themeColor || '#007bff';
        document.documentElement.style.setProperty('--primary-color', color);
        
        // 更新相关UI元素的颜色
        const primaryElements = document.querySelectorAll('.btn-primary, .bg-primary');
        primaryElements.forEach(element => {
            element.style.backgroundColor = color;
            element.style.borderColor = color;
        });
    },
    
    // 应用设置
    applySettings: function() {
        // 应用主题颜色
        this.applyThemeColor();
    },
    
    // 设置主题
    setTheme: function(theme) {
        this.settings.theme = theme;
        this.applyTheme();
        this.saveSettings();
    },
    
    // 获取设置值
    getSetting: function(key) {
        return this.settings[key];
    },
    
    // 设置单个设置值
    setSetting: function(key, value) {
        this.settings[key] = value;
        this.saveSettings();
    },
    
    // 重置所有设置为默认值
    resetSettings: function() {
        this.settings = {
            theme: AppConfig.theme,
            fontSize: 'medium',
            notifications: true
        };
        
        this.saveSettings();
        this.applySettings();
        
        Logger.info('设置已重置为默认值');
        showSuccessMessage('设置已重置为默认值');
    }
};

// 显示成功消息
function showSuccessMessage(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show fixed-top m-3';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="close" data-dismiss="alert">
            <span>&times;</span>
        </button>
    `;
    document.body.appendChild(alertDiv);
    
    // 3秒后自动关闭
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => alertDiv.remove(), 500);
    }, 3000);
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
    
    // 3秒后自动关闭
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => alertDiv.remove(), 500);
    }, 3000);
}

// 导出模块（用于测试）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UserSettings;
}