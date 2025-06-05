/**
 * 课程模型
 * 定义课程相关的数据结构和数据库交互方法
 */
const { pool } = require('../config/db');

class Course {
  /**
   * 获取所有课程
   * @param {Object} options - 查询选项
   * @param {number} options.limit - 限制返回数量
   * @param {number} options.offset - 偏移量（分页）
   * @param {string} options.sortBy - 排序字段
   * @param {string} options.sortOrder - 排序方向 (ASC/DESC)
   * @returns {Promise<Array>} - 返回课程列表
   */
  static async findAll(options = {}) {
    try {
      const limit = options.limit || 20;
      const offset = options.offset || 0;
      const sortBy = options.sortBy || 'created_at';
      const sortOrder = options.sortOrder || 'DESC';
      
      const [rows] = await pool.query(
        `SELECT * FROM courses ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`,
        [limit, offset]
      );
      
      return rows;
    } catch (error) {
      console.error('获取课程列表失败:', error);
      throw error;
    }
  }

  /**
   * 根据ID获取课程
   * @param {number} id - 课程ID
   * @returns {Promise<Object|null>} - 返回课程对象或null
   */
  static async findById(id) {
    try {
      const [rows] = await pool.query('SELECT * FROM courses WHERE id = ?', [id]);
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('获取课程详情失败:', error);
      throw error;
    }
  }

  /**
   * 搜索课程
   * @param {string} keyword - 搜索关键词
   * @param {Object} options - 查询选项
   * @returns {Promise<Array>} - 返回匹配的课程列表
   */
  static async search(keyword, options = {}) {
    try {
      const limit = options.limit || 20;
      const offset = options.offset || 0;
      
      // 确保查询字段与数据库一致
      const [rows] = await pool.query(
        `SELECT * FROM courses 
         WHERE title LIKE ? OR description LIKE ? 
         ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [`%${keyword}%`, `%${keyword}%`, limit, offset]
      );
      
      return rows;
    } catch (error) {
      console.error('搜索课程失败:', error);
      throw error;
    }
  }

  /**
   * 创建新课程
   * @param {Object} courseData - 课程数据
   * @returns {Promise<Object>} - 返回创建的课程对象
   */
  static async create(courseData) {
    try {
      const { title, description, cover_url, video_url, duration, source, source_id, user_id } = courseData;
      
      // 修改SQL语句，确保字段与数据库一致
      // 添加created_at和updated_at字段
      const [result] = await pool.query(
        `INSERT INTO courses (title, description, cover_url, video_url, duration, source, source_id, user_id, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [title, description, cover_url, video_url, duration, source, source_id, user_id]
      );
      
      return {
        id: result.insertId,
        ...courseData,
        created_at: new Date(),
        updated_at: new Date()
      };
    } catch (error) {
      console.error('创建课程失败:', error);
      throw error;
    }
  }

  /**
   * 更新课程信息
   * @param {number} id - 课程ID
   * @param {Object} updateData - 要更新的字段
   * @returns {Promise<boolean>} - 更新成功返回true
   */
  static async update(id, updateData) {
    try {
      // 构建更新SQL
      const keys = Object.keys(updateData);
      const values = Object.values(updateData);
      
      if (keys.length === 0) return true;
      
      const setClause = keys.map(key => `${key} = ?`).join(', ');
      
      // 执行更新，添加updated_at字段
      const [result] = await pool.query(
        `UPDATE courses SET ${setClause}, updated_at = NOW() WHERE id = ?`,
        [...values, id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('更新课程失败:', error);
      throw error;
    }
  }

  /**
   * 删除课程
   * @param {number} id - 课程ID
   * @returns {Promise<boolean>} - 删除成功返回true
   */
  static async delete(id) {
    try {
      const [result] = await pool.query('DELETE FROM courses WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('删除课程失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户创建的课程
   * @param {number} userId - 用户ID
   * @param {Object} options - 查询选项
   * @returns {Promise<Array>} - 返回课程列表
   */
  static async findByUserId(userId, options = {}) {
    try {
      const limit = options.limit || 20;
      const offset = options.offset || 0;
      
      const [rows] = await pool.query(
        'SELECT * FROM courses WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [userId, limit, offset]
      );
      
      return rows;
    } catch (error) {
      console.error('获取用户课程失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户收藏的课程
   * @param {number} userId - 用户ID
   * @param {Object} options - 查询选项
   * @returns {Promise<Array>} - 返回课程列表
   */
  static async findFavoritesByUserId(userId, options = {}) {
    try {
      const limit = options.limit || 20;
      const offset = options.offset || 0;
      
      const [rows] = await pool.query(
        `SELECT c.* FROM courses c 
         JOIN favorites f ON c.id = f.course_id 
         WHERE f.user_id = ? 
         ORDER BY f.created_at DESC LIMIT ? OFFSET ?`,
        [userId, limit, offset]
      );
      
      return rows;
    } catch (error) {
      console.error('获取收藏课程失败:', error);
      throw error;
    }
  }

  /**
   * 添加课程到收藏
   * @param {number} userId - 用户ID
   * @param {number} courseId - 课程ID
   * @returns {Promise<boolean>} - 添加成功返回true
   */
  static async addToFavorites(userId, courseId) {
    try {
      await pool.query(
        'INSERT INTO favorites (user_id, course_id) VALUES (?, ?)',
        [userId, courseId]
      );
      
      return true;
    } catch (error) {
      // 如果是唯一键冲突（已经收藏过），不视为错误
      if (error.code === 'ER_DUP_ENTRY') {
        return true;
      }
      console.error('添加收藏失败:', error);
      throw error;
    }
  }

  /**
   * 从收藏中移除课程
   * @param {number} userId - 用户ID
   * @param {number} courseId - 课程ID
   * @returns {Promise<boolean>} - 移除成功返回true
   */
  static async removeFromFavorites(userId, courseId) {
    try {
      const [result] = await pool.query(
        'DELETE FROM favorites WHERE user_id = ? AND course_id = ?',
        [userId, courseId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('移除收藏失败:', error);
      throw error;
    }
  }

  /**
   * 检查课程是否已被收藏
   * @param {number} userId - 用户ID
   * @param {number} courseId - 课程ID
   * @returns {Promise<boolean>} - 已收藏返回true
   */
  static async isFavorite(userId, courseId) {
    try {
      const [rows] = await pool.query(
        'SELECT 1 FROM favorites WHERE user_id = ? AND course_id = ?',
        [userId, courseId]
      );
      
      return rows.length > 0;
    } catch (error) {
      console.error('检查收藏状态失败:', error);
      throw error;
    }
  }

  /**
   * 更新观看历史
   * @param {number} userId - 用户ID
   * @param {number} courseId - 课程ID
   * @param {number} position - 视频播放位置（秒）
   * @param {number} progress - 观看进度（百分比）
   * @param {boolean} watched - 是否已看完
   * @returns {Promise<boolean>} - 更新成功返回true
   */
  static async updateWatchHistory(userId, courseId, position, progress, watched = false) {
    try {
      // 检查是否已有观看记录
      const [existingRows] = await pool.query(
        'SELECT id FROM watch_history WHERE user_id = ? AND course_id = ?',
        [userId, courseId]
      );
      
      if (existingRows.length > 0) {
        // 更新现有记录
        await pool.query(
          `UPDATE watch_history 
           SET last_position = ?, progress = ?, watched = ?, updated_at = NOW() 
           WHERE user_id = ? AND course_id = ?`,
          [position, progress, watched, userId, courseId]
        );
      } else {
        // 创建新记录
        await pool.query(
          `INSERT INTO watch_history (user_id, course_id, last_position, progress, watched) 
           VALUES (?, ?, ?, ?, ?)`,
          [userId, courseId, position, progress, watched]
        );
      }
      
      return true;
    } catch (error) {
      console.error('更新观看历史失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户观看历史
   * @param {number} userId - 用户ID
   * @param {Object} options - 查询选项
   * @returns {Promise<Array>} - 返回观看历史列表
   */
  static async getWatchHistory(userId, options = {}) {
    try {
      const limit = options.limit || 20;
      const offset = options.offset || 0;
      
      const [rows] = await pool.query(
        `SELECT c.*, w.progress, w.last_position, w.watched, w.updated_at as last_watched 
         FROM courses c 
         JOIN watch_history w ON c.id = w.course_id 
         WHERE w.user_id = ? 
         ORDER BY w.updated_at DESC LIMIT ? OFFSET ?`,
        [userId, limit, offset]
      );
      
      return rows;
    } catch (error) {
      console.error('获取观看历史失败:', error);
      throw error;
    }
  }

  /**
   * 获取课程的观看状态
   * @param {number} userId - 用户ID
   * @param {number} courseId - 课程ID
   * @returns {Promise<Object|null>} - 返回观看状态或null
   */
  static async getWatchStatus(userId, courseId) {
    try {
      const [rows] = await pool.query(
        `SELECT progress, last_position, watched, updated_at as last_watched 
         FROM watch_history 
         WHERE user_id = ? AND course_id = ?`,
        [userId, courseId]
      );
      
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('获取观看状态失败:', error);
      throw error;
    }
  }

  
  /**
 * 批量创建课程
 * @param {Array<Object>} coursesData - 课程数据数组
 * @returns {Promise<Array>} - 返回创建的课程对象数组
 */
static async createBatch(coursesData) {
  try {
      // 只保留必要的字段
      const values = coursesData.map(course => [
          course.title,
          course.teacher
      ]);
      
      // 使用批量插入
      const [result] = await pool.query(
          'INSERT INTO courses (title, teacher) VALUES ?',
          [values]
      );
      
      // 返回插入的课程数据
      return coursesData.map((course, index) => ({
          id: result.insertId + index,
          title: course.title,
          teacher: course.teacher,
          created_at: new Date(),
          updated_at: new Date()
      }));
  } catch (error) {
      console.error('批量创建课程失败:', error);
      throw error;
  }
}
}




module.exports = Course;
