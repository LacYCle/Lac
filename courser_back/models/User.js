/**
 * 用户模型
 * 定义用户相关的数据结构和数据库交互方法
 */
const bcrypt = require('bcrypt');
const { pool } = require('../config/db');

class User {
  /**
   * 根据用户ID获取用户信息
   * @param {number} id - 用户ID
   * @returns {Promise<Object|null>} - 返回用户对象或null
   */
  static async findById(id) {
    try {
      const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('查询用户失败:', error);
      throw error;
    }
  }

  /**
   * 根据邮箱查找用户
   * @param {string} email - 用户邮箱
   * @returns {Promise<Object|null>} - 返回用户对象或null
   */
  static async findByEmail(email) {
    try {
      const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('通过邮箱查询用户失败:', error);
      throw error;
    }
  }

  /**
   * 创建新用户
   * @param {Object} userData - 用户数据对象
   * @param {string} userData.username - 用户名
   * @param {string} userData.email - 邮箱
   * @param {string} userData.password - 密码(明文)
   * @returns {Promise<Object>} - 返回创建的用户对象(不含密码)
   */
  static async create(userData) {
    try {
      // 密码加密
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
      
      // 插入用户数据，确保包含created_at和updated_at
      const [result] = await pool.query(
        'INSERT INTO users (username, email, password, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
        [userData.username, userData.email, hashedPassword]
      );
      
      // 返回创建的用户信息(不含密码)
      return {
        id: result.insertId,
        username: userData.username,
        email: userData.email,
        created_at: new Date(),
        updated_at: new Date()
      };
    } catch (error) {
      console.error('创建用户失败:', error);
      throw error;
    }
  }

  /**
   * 验证用户登录
   * @param {string} email - 用户邮箱
   * @param {string} password - 用户密码(明文)
   * @returns {Promise<Object|null>} - 验证成功返回用户对象(不含密码)，失败返回null
   */
  static async authenticate(email, password) {
    try {
      // 查询用户
      const user = await this.findByEmail(email);
      if (!user) return null;
      
      // 验证密码
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return null;
      
      // 返回用户信息(不含密码)
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error('用户验证失败:', error);
      throw error;
    }
  }

  /**
   * 更新用户信息
   * @param {number} id - 用户ID
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
        `UPDATE users SET ${setClause}, updated_at = NOW() WHERE id = ?`,
        [...values, id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('更新用户失败:', error);
      throw error;
    }
  }

  /**
   * 更新用户密码
   * @param {number} id - 用户ID
   * @param {string} newPassword - 新密码(明文)
   * @returns {Promise<boolean>} - 更新成功返回true
   */
  static async updatePassword(id, newPassword) {
    try {
      // 密码加密
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      
      // 更新密码
      const [result] = await pool.query(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('更新密码失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户设置
   * @param {number} userId - 用户ID
   * @returns {Promise<Object>} - 返回用户设置
   */
  static async getSettings(userId) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM user_settings WHERE user_id = ?',
        [userId]
      );
      
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('获取用户设置失败:', error);
      throw error;
    }
  }

  /**
   * 保存用户设置
   * @param {number} userId - 用户ID
   * @param {Object} settings - 设置对象
   * @returns {Promise<boolean>} - 保存成功返回true
   */
  static async saveSettings(userId, settings) {
    try {
      // 检查是否已有设置
      const existingSettings = await this.getSettings(userId);
      
      if (existingSettings) {
        // 更新现有设置
        const keys = Object.keys(settings);
        const values = Object.values(settings);
        
        if (keys.length === 0) return true;
        
        const setClause = keys.map(key => `${key} = ?`).join(', ');
        
        const [result] = await pool.query(
          `UPDATE user_settings SET ${setClause} WHERE user_id = ?`,
          [...values, userId]
        );
        
        return result.affectedRows > 0;
      } else {
        // 创建新设置
        const keys = ['user_id', ...Object.keys(settings)];
        const values = [userId, ...Object.values(settings)];
        
        const placeholders = keys.map(() => '?').join(', ');
        const columns = keys.join(', ');
        
        const [result] = await pool.query(
          `INSERT INTO user_settings (${columns}) VALUES (${placeholders})`,
          values
        );
        
        return result.affectedRows > 0;
      }
    } catch (error) {
      console.error('保存用户设置失败:', error);
      throw error;
    }
  }
}

module.exports = User;