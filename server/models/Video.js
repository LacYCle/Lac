/**
 * 视频模型
 * 定义视频相关的数据结构和数据库交互方法
 */
const { pool } = require('../config/db');
const { searchBilibiliCourses } = require('../services/searchService');

class Video {
  /**
   * 搜索视频
   * @param {string} keyword - 搜索关键词
   * @param {number} limit - 返回结果数量限制
   * @returns {Promise<Array>} - 返回搜索结果
   */
  static async search(keyword, limit = 10) {
    try {
      // 使用searchService搜索B站视频
      const results = await searchBilibiliCourses(keyword, 1, 'click');
      return results ? results.slice(0, limit) : [];
    } catch (error) {
      console.error('视频搜索失败:', error);
      throw error;
    }
  }

  /**
   * 获取视频详情
   * @param {string} videoId - 视频ID
   * @param {string} source - 视频来源平台
   * @returns {Promise<Object|null>} - 返回视频详情或null
   */
  static async getVideoDetails(videoId, source = 'bilibili') {
    try {
      // 首先检查数据库中是否已有该视频信息
      const [rows] = await pool.query(
        'SELECT * FROM courses WHERE source_id = ? AND source = ?',
        [videoId, source]
      );
      
      if (rows.length > 0) {
        return rows[0];
      }
      
      // 如果数据库中没有，则通过API获取
      if (source === 'bilibili') {
        // 这里可以调用B站API获取视频详情
        // 由于没有实际的B站API调用实现，这里仅作为示例
        const results = await searchBilibiliCourses(videoId, 1);
        return results.length > 0 ? results[0] : null;
      }
      
      return null;
    } catch (error) {
      console.error('获取视频详情失败:', error);
      throw error;
    }
  }

  /**
   * 保存视频信息到数据库
   * @param {Object} videoData - 视频数据
   * @param {number} userId - 用户ID
   * @returns {Promise<Object>} - 返回保存的视频对象
   */
  static async save(videoData, userId) {
    try {
      // 检查视频是否已存在
      const [existingRows] = await pool.query(
        'SELECT id FROM courses WHERE source_id = ? AND source = ?',
        [videoData.source_id, videoData.source]
      );
      
      if (existingRows.length > 0) {
        // 视频已存在，返回现有记录
        const [courseRows] = await pool.query('SELECT * FROM courses WHERE id = ?', [existingRows[0].id]);
        return courseRows[0];
      }
      
      // 插入新视频
      const [result] = await pool.query(
        `INSERT INTO courses (title, description, cover_url, video_url, duration, source, source_id, user_id) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          videoData.title,
          videoData.description || '',
          '', // 没有cover_url字段，使用空字符串
          videoData.video_url,
          '', // 没有duration字段，使用空字符串
          videoData.source || 'bilibili',
          videoData.source_id || '', // 可能没有source_id
          userId
        ]
      );
      
      // 返回创建的视频信息
      return {
        id: result.insertId,
        title: videoData.title,
        video_url: videoData.video_url,
        uploader: videoData.uploader,
        description: '',
        cover_url: '',
        duration: '',
        source: videoData.source || 'bilibili',
        source_id: videoData.source_id || '',
        user_id: userId,
        created_at: new Date()
      };
    } catch (error) {
      console.error('保存视频失败:', error);
      throw error;
    }
  }

  /**
   * 获取推荐视频
   * @param {number} userId - 用户ID
   * @param {number} limit - 返回结果数量限制
   * @returns {Promise<Array>} - 返回推荐视频列表
   */
  static async getRecommendations(userId, limit = 10) {
    try {
      // 基于用户观看历史推荐视频
      // 1. 获取用户最近观看的视频类别
      const [watchHistory] = await pool.query(
        `SELECT c.* FROM courses c 
         JOIN watch_history w ON c.id = w.course_id 
         WHERE w.user_id = ? 
         ORDER BY w.updated_at DESC LIMIT 5`,
        [userId]
      );
      
      if (watchHistory.length === 0) {
        // 如果没有观看历史，返回热门视频
        const [popularVideos] = await pool.query(
          'SELECT * FROM courses ORDER BY RAND() LIMIT ?',
          [limit]
        );
        return popularVideos;
      }
      
      // 2. 提取观看历史中的视频标题，用于推荐相似内容
      const keywords = watchHistory.map(video => video.title.split(' ')[0]).join(' ');
      
      // 3. 搜索相关视频
      const recommendations = await this.search(keywords, limit);
      return recommendations;
    } catch (error) {
      console.error('获取推荐视频失败:', error);
      throw error;
    }
  }

  /**
   * 获取热门视频
   * @param {number} limit - 返回结果数量限制
   * @returns {Promise<Array>} - 返回热门视频列表
   */
  static async getPopular(limit = 10) {
    try {
      // 这里可以根据实际需求定义热门视频的获取逻辑
      // 例如：根据观看次数、收藏数等排序
      const [rows] = await pool.query(
        `SELECT c.*, COUNT(w.id) as view_count 
         FROM courses c 
         LEFT JOIN watch_history w ON c.id = w.course_id 
         GROUP BY c.id 
         ORDER BY view_count DESC LIMIT ?`,
        [limit]
      );
      
      return rows;
    } catch (error) {
      console.error('获取热门视频失败:', error);
      throw error;
    }
  }

  /**
   * 获取最新视频
   * @param {number} limit - 返回结果数量限制
   * @returns {Promise<Array>} - 返回最新视频列表
   */
  static async getLatest(limit = 10) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM courses ORDER BY created_at DESC LIMIT ?',
        [limit]
      );
      
      return rows;
    } catch (error) {
      console.error('获取最新视频失败:', error);
      throw error;
    }
  }
}

module.exports = Video;