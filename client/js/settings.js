/**
 * Courser - 在线网课学习平台
 * 用户设置模块
 */

const UserSettings = {
    // 用户设置数据
    settings: {
        // 视频设置
        defaultQuality: '720',
        defaultSpeed: '1.0',
        volumeLevel: 80,
        autoplay: true,
        
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
        document.getElementById('settingsButton').addEventListener('click', () => {
            this.populateSettingsForm();
            $('#settingsModal').modal('show');
        });
        
        // 设置表单提交事件
        document.getElementById('settingsForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSettingsFromForm();
        });
        
        // 音量滑块变化事件
        document.getElementById('volumeLevel').addEventListener('input', (e) => {
            document.getElementById('volumeValue').textContent = e.target.value + '%';
        });
        
        // 主题切换事件
        const themeRadios = document.querySelectorAll('input[name="theme"]');
        themeRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.checked) {
                    this.setTheme(radio.value);
                }
            });
        });
    },
    
    // 填充设置表单
    populateSettingsForm: function() {
        // 设置视频画质
        document.getElementById('defaultQuality').value = this.settings.defaultQuality;
        
        // 设置播放速度
        document.getElementById('defaultSpeed').value = this.settings.defaultSpeed;
        
        // 设置音量
        const volumeSlider = document.getElementById('volumeLevel');
        volumeSlider.value = this.settings.volumeLevel;
        document.getElementById('volumeValue').textContent = this.settings.volumeLevel + '%';
        
        // 设置自动播放
        document.getElementById('autoplay').checked = this.settings.autoplay;
        
        // 设置主题
        const themeRadio = document.querySelector(`input[name="theme"][value="${this.settings.theme}"]`);
        if (themeRadio) {
            themeRadio.checked = true;
        }
        
        // 设置字体大小
        const fontSizeRadio = document.querySelector(`input[name="fontSize"][value="${this.settings.fontSize}"]`);
        if (fontSizeRadio) {
            fontSizeRadio.checked = true;
        }
        
        // 设置通知
        document.getElementById('enableNotifications').checked = this.settings.notifications;
    },
    
    // 从表单保存设置
    saveSettingsFromForm: function() {
        // 获取视频设置
        this.settings.defaultQuality = document.getElementById('defaultQuality').value;
        this.settings.defaultSpeed = document.getElementById('defaultSpeed').value;
        this.settings.volumeLevel = parseInt(document.getElementById('volumeLevel').value);
        this.settings.autoplay = document.getElementById('autoplay').checked;
        
        // 获取界面设置
        const themeRadio = document.querySelector('input[name="theme"]:checked');
        if (themeRadio) {
            this.settings.theme = themeRadio.value;
        }
        
        const fontSizeRadio = document.querySelector('input[name="fontSize"]:checked');
        if (fontSizeRadio) {
            this.settings.fontSize = fontSizeRadio.value;
        }
        
        this.settings.notifications = document.getElementById('enableNotifications').checked;
        
        // 保存设置
        this.saveSettings();
        
        // 应用设置
        this.applySettings();
        
        // 关闭设置模态框
        $('#settingsModal').modal('hide');
        
        // 显示成功消息
        showSuccessMessage('设置已保存');
    },
    
    // 应用设置
    applySettings: function() {
        // 应用主题
        this.applyTheme();
        
        // 应用字体大小
        this.applyFontSize();
        
        // 如果视频播放器已初始化，则更新视频设置
        if (typeof VideoPlayer !== 'undefined') {
            VideoPlayer.settings.quality = this.settings.defaultQuality;
            VideoPlayer.settings.playbackSpeed = this.settings.defaultSpeed;
            VideoPlayer.settings.volume = this.settings.volumeLevel;
            VideoPlayer.settings.autoplay = this.settings.autoplay;
        }
        
        Logger.info('设置已应用');
    },
    
    // 应用主题
    applyTheme: function() {
        if (this.settings.theme === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    },
    
    // 应用字体大小
    applyFontSize: function() {
        // 移除所有字体大小类
        document.body.classList.remove('font-size-small', 'font-size-medium', 'font-size-large');
        
        // 添加当前字体大小类
        document.body.classList.add(`font-size-${this.settings.fontSize}`);
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
            defaultQuality: AppConfig.defaultVideoQuality,
            defaultSpeed: AppConfig.defaultPlaybackSpeed,
            volumeLevel: AppConfig.defaultVolume,
            autoplay: AppConfig.autoplay,
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