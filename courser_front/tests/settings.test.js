describe('UserSettings模块', () => {
  let UserSettings;
  
  beforeEach(() => {
    // 清除localStorage
    localStorage.clear();
    // 导入模块
    UserSettings = require('../js/settings');
    // 重置模块状态
    UserSettings.settings = {
      defaultQuality: '720',
      defaultSpeed: '1.0',
      volumeLevel: 80,
      autoplay: true,
      theme: 'light',
      fontSize: 'medium',
      notifications: true
    };
  });

  test('应正确加载用户设置', () => {
    // 模拟localStorage中的设置数据
    const customSettings = {
      defaultQuality: '1080',
      theme: 'dark',
      fontSize: 'large'
    };
    localStorage.setItem('userSettings', JSON.stringify(customSettings));
    
    // 加载设置
    UserSettings.loadSettings();
    
    // 验证设置已正确加载和合并
    expect(UserSettings.settings.defaultQuality).toBe('1080');
    expect(UserSettings.settings.defaultSpeed).toBe('1.0'); // 保持默认值
    expect(UserSettings.settings.theme).toBe('dark');
    expect(UserSettings.settings.fontSize).toBe('large');
  });

  test('应正确保存用户设置', () => {
    // 修改设置
    UserSettings.settings.defaultQuality = '1080';
    UserSettings.settings.theme = 'dark';
    
    // 保存设置
    UserSettings.saveSettings();
    
    // 验证设置已保存到localStorage
    const savedSettings = JSON.parse(localStorage.getItem('userSettings'));
    expect(savedSettings.defaultQuality).toBe('1080');
    expect(savedSettings.theme).toBe('dark');
  });

  test('应正确应用主题设置', () => {
    // 设置深色主题
    UserSettings.settings.theme = 'dark';
    UserSettings.applyTheme();
    
    // 验证body添加了dark-mode类
    expect(document.body.classList.contains('dark-mode')).toBe(true);
    
    // 设置浅色主题
    UserSettings.settings.theme = 'light';
    UserSettings.applyTheme();
    
    // 验证body移除了dark-mode类
    expect(document.body.classList.contains('dark-mode')).toBe(false);
  });

  test('应正确重置所有设置', () => {
    // 修改设置
    UserSettings.settings.defaultQuality = '1080';
    UserSettings.settings.theme = 'dark';
    UserSettings.settings.fontSize = 'large';
    
    // 重置设置
    UserSettings.resetSettings();
    
    // 验证设置已重置为默认值
    expect(UserSettings.settings.defaultQuality).toBe(AppConfig.defaultVideoQuality);
    expect(UserSettings.settings.theme).toBe(AppConfig.theme);
    expect(UserSettings.settings.fontSize).toBe('medium');
  });
});