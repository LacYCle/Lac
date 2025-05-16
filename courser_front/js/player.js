/**
 * Courser - 在线网课学习平台
 * 视频播放器模块
 */

const VideoPlayer = {
    // 当前播放的视频
    currentVideo: null,
    // 播放器设置
    settings: {
        quality: '720',
        playbackSpeed: '1.0',
        volume: 80,
        autoplay: true
    },
    
    // 初始化视频播放器
    init: function() {
        Logger.info('初始化视频播放器模块');
        
        // 从用户设置中加载播放器配置
        this.loadSettings();
        
        // 绑定视频播放器事件
        this.bindEvents();
    },
    
    // 加载播放器设置
    loadSettings: function() {
        try {
            // 从用户设置中获取播放器配置
            this.settings.quality = UserSettings.getSetting('defaultQuality') || AppConfig.defaultVideoQuality;
            this.settings.playbackSpeed = UserSettings.getSetting('defaultSpeed') || AppConfig.defaultPlaybackSpeed;
            this.settings.volume = UserSettings.getSetting('volumeLevel') || AppConfig.defaultVolume;
            this.settings.autoplay = UserSettings.getSetting('autoplay') !== undefined ? UserSettings.getSetting('autoplay') : AppConfig.autoplay;
            
            Logger.info('视频播放器设置加载成功');
        } catch (error) {
            Logger.error('加载视频播放器设置失败', error);
        }
    },
    
    // 绑定视频播放器事件
    bindEvents: function() {
        // 视频模态框显示事件
        $('#videoModal').on('shown.bs.modal', () => {
            const videoPlayer = document.getElementById('videoPlayer');
            
            // 设置音量
            videoPlayer.volume = this.settings.volume / 100;
            
            // 设置播放速度
            videoPlayer.playbackRate = parseFloat(this.settings.playbackSpeed);
            
            // 如果设置了自动播放，则自动开始播放
            if (this.settings.autoplay) {
                videoPlayer.play().catch(error => {
                    Logger.warn('自动播放失败，可能是浏览器策略限制', error);
                });
            }
        });
        
        // 视频模态框关闭事件
        $('#videoModal').on('hidden.bs.modal', () => {
            const videoPlayer = document.getElementById('videoPlayer');
            videoPlayer.pause();
            videoPlayer.currentTime = 0;
        });
        
        // 视频播放结束事件
        document.getElementById('videoPlayer').addEventListener('ended', () => {
            if (this.currentVideo) {
                // 标记为已观看
                CourseManager.markAsWatched(this.currentVideo.id);
                
                Logger.info(`视频 ID:${this.currentVideo.id} 播放完成`);
            }
        });
        
        // 视频质量选择
        const qualityItems = document.querySelectorAll('#videoQualityDropdown + .dropdown-menu .dropdown-item');
        qualityItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const quality = e.target.textContent.trim();
                this.setVideoQuality(quality);
            });
        });
        
        // 播放速度选择
        const speedItems = document.querySelectorAll('#playbackSpeedDropdown + .dropdown-menu .dropdown-item');
        speedItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const speed = e.target.textContent.trim();
                this.setPlaybackSpeed(speed);
            });
        });
    },
    
    // 播放视频
    // 播放视频
    playVideo: function(video) {
        if (!video) return;
        
        this.currentVideo = video;
        
        // 设置视频源
        const videoPlayer = document.getElementById('videoPlayer');
        const videoSource = video.video_url || '#';
        videoPlayer.src = videoSource;
        
        // 设置视频标题
        document.getElementById('videoTitle').textContent = video.title;
        
        // 设置视频上传者信息（如果有）
        const uploaderInfo = document.getElementById('uploaderInfo');
        if (uploaderInfo) {
            uploaderInfo.textContent = video.uploader ? `上传者: ${video.uploader}` : '';
        }
        
        // 加载视频
        videoPlayer.load();
        
        Logger.info(`准备播放视频: ${video.title}`);
    },
    
    // 根据画质获取视频源 - 简化此方法，因为我们现在只有一个video_url
    getVideoSourceByQuality: function(baseUrl, quality) {
        // 直接返回视频URL，不再考虑画质
        return baseUrl || '#';
    },
    
    // 设置视频画质
    setVideoQuality: function(quality) {
        // 从显示文本中提取画质值
        const qualityValue = quality.match(/(\d+)p/)[1];
        
        // 更新设置
        this.settings.quality = qualityValue;
        
        // 如果当前有视频在播放，则切换画质
        if (this.currentVideo) {
            const videoPlayer = document.getElementById('videoPlayer');
            const currentTime = videoPlayer.currentTime;
            const isPaused = videoPlayer.paused;
            
            // 获取新画质的视频源
            const videoSource = this.getVideoSourceByQuality(this.currentVideo.videoUrl, qualityValue);
            videoPlayer.src = videoSource;
            
            // 加载视频并恢复播放位置
            videoPlayer.load();
            videoPlayer.currentTime = currentTime;
            
            if (!isPaused) {
                videoPlayer.play();
            }
        }
        
        Logger.info(`视频画质已设置为: ${quality}`);
        showSuccessMessage(`视频画质已切换为 ${quality}`);
    },
    
    // 设置播放速度
    setPlaybackSpeed: function(speed) {
        // 提取速度值
        const speedValue = speed.replace('x', '');
        
        // 更新设置
        this.settings.playbackSpeed = speedValue;
        
        // 应用到当前视频
        const videoPlayer = document.getElementById('videoPlayer');
        videoPlayer.playbackRate = parseFloat(speedValue);
        
        Logger.info(`播放速度已设置为: ${speed}`);
        showSuccessMessage(`播放速度已设置为 ${speed}`);
    },
    
    // 设置音量
    setVolume: function(volume) {
        // 更新设置
        this.settings.volume = volume;
        
        // 应用到当前视频
        const videoPlayer = document.getElementById('videoPlayer');
        videoPlayer.volume = volume / 100;
        
        Logger.info(`音量已设置为: ${volume}%`);
    },
    
    // 保存播放器设置到用户设置
    saveSettings: function() {
        UserSettings.setSetting('defaultQuality', this.settings.quality);
        UserSettings.setSetting('defaultSpeed', this.settings.playbackSpeed);
        UserSettings.setSetting('volumeLevel', this.settings.volume);
        UserSettings.setSetting('autoplay', this.settings.autoplay);
        
        Logger.info('视频播放器设置已保存');
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

// 导出模块（用于测试）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VideoPlayer;
}