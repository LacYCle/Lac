/**
 * 视频控制器
 * 处理视频相关的请求
 */
const Video = require('../models/Video');
const { validationResult } = require('express-validator');

/**
 * 搜索视频
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.searchVideos = async (req, res) => {
  try {
    const { keyword, limit = 10 } = req.query;
    
    if (!keyword) {
      return res.status(400).json({ message: '搜索关键词不能为空' });
    }
    
    // 搜索视频
    const videos = await Video.search(keyword, parseInt(limit));
    
    res.json({ videos });
  } catch (error) {
    console.error('搜索视频失败:', error);
    res.status(500).json({ message: '服务器错误，请稍后重试' });
  }
};

/**
 * 获取视频详情
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getVideoDetails = async (req, res) => {
  try {
    const { videoId, source = 'bilibili' } = req.params;
    
    // 获取视频详情
    const video = await Video.getVideoDetails(videoId, source);
    if (!video) {
      return res.status(404).json({ message: '视频不存在' });
    }
    
    res.json({ video });
  } catch (error) {
    console.error('获取视频详情失败:', error);
    res.status(500).json({ message: '服务器错误，请稍后重试' });
  }
};

/**
 * 保存视频
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.saveVideo = async (req, res) => {
  try {
    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const userId = req.user.id;
    const videoData = req.body;
    
    // 保存视频
    const video = await Video.save(videoData, userId);
    
    res.status(201).json({
      message: '视频保存成功',
      video
    });
  } catch (error) {
    console.error('保存视频失败:', error);
    res.status(500).json({ message: '服务器错误，请稍后重试' });
  }
};

/**
 * 获取推荐视频
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getRecommendations = async (req, res) => {
  try {
    const { keyword, limit = 20 } = req.query;
    
    if (!keyword) {
      return res.status(400).json({ message: '推荐关键词不能为空' });
    }
    
    // 搜索相关视频作为推荐
    const videos = await Video.search(keyword, parseInt(limit));
    
    res.json({ videos });
  } catch (error) {
    console.error('获取推荐视频失败:', error);
    res.status(500).json({ message: '服务器错误，请稍后重试' });
  }
};

/**
 * 获取热门视频
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getPopularVideos = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // 获取热门视频
    const videos = await Video.getPopular(parseInt(limit));
    
    res.json({ videos });
  } catch (error) {
    console.error('获取热门视频失败:', error);
    res.status(500).json({ message: '服务器错误，请稍后重试' });
  }
};

/**
 * 获取最新视频
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getLatestVideos = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // 获取最新视频
    const videos = await Video.getLatest(parseInt(limit));
    
    res.json({ videos });
  } catch (error) {
    console.error('获取最新视频失败:', error);
    res.status(500).json({ message: '服务器错误，请稍后重试' });
  }
};