describe('VideoPlayer模块', () => {
  let VideoPlayer;
  
  beforeEach(() => {
    // 导入模块
    VideoPlayer = require('../js/player');
    // 重置模块状态
    VideoPlayer.settings = {
      quality: '720',
      playbackSpeed: '1.0',
      volume: 80,
      autoplay: true
    };
    VideoPlayer.currentVideo = null;
  });

  test('应正确加载播放器设置', () => {
    // 模拟UserSettings模块
    global.UserSettings = {
      getSetting: jest.fn().mockImplementation((key) => {
        if (key === 'defaultQuality') return '1080';
        if (key === 'defaultSpeed') return '1.5';
        if (key === 'volumeLevel') return 60;
        if (key === 'autoplay') return false;
        return null;
      })
    };
    
    // 加载设置
    VideoPlayer.loadSettings();
    
    // 验证设置已正确加载
    expect(VideoPlayer.settings.quality).toBe('1080');
    expect(VideoPlayer.settings.playbackSpeed).toBe('1.5');
    expect(VideoPlayer.settings.volume).toBe(60);
    expect(VideoPlayer.settings.autoplay).toBe(false);
  });

  test('应正确设置视频画质', () => {
    // 模拟视频元素
    const mockVideoElement = {
      src: '',
      load: jest.fn(),
      currentTime: 0,
      paused: true
    };
    document.getElementById = jest.fn().mockReturnValue(mockVideoElement);
    
    // 设置当前视频
    VideoPlayer.currentVideo = { id: 1, title: '测试视频', videoUrl: 'test.mp4' };
    
    // 设置画质
    VideoPlayer.setVideoQuality('高清 (1080p)');
    
    // 验证设置已更新
    expect(VideoPlayer.settings.quality).toBe('1080');
    // 验证视频已重新加载
    expect(mockVideoElement.load).toHaveBeenCalled();
  });

  test('应正确设置播放速度', () => {
    // 模拟视频元素
    const mockVideoElement = {
      playbackRate: 1.0
    };
    document.getElementById = jest.fn().mockReturnValue(mockVideoElement);
    
    // 设置播放速度
    VideoPlayer.setPlaybackSpeed('1.5x');
    
    // 验证设置已更新
    expect(VideoPlayer.settings.playbackSpeed).toBe('1.5');
    // 验证视频播放速度已更新
    expect(mockVideoElement.playbackRate).toBe(1.5);
  });

  test('应正确设置音量', () => {
    // 模拟视频元素
    const mockVideoElement = {
      volume: 0.8
    };
    document.getElementById = jest.fn().mockReturnValue(mockVideoElement);
    
    // 设置音量
    VideoPlayer.setVolume(50);
    
    // 验证设置已更新
    expect(VideoPlayer.settings.volume).toBe(50);
    // 验证视频音量已更新
    expect(mockVideoElement.volume).toBe(0.5);
  });
});