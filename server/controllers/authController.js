/**
 * 用户认证控制器
 * 处理用户注册、登录等认证相关请求
 */
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// 导入JWT密钥
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * 用户注册
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.register = async (req, res) => {
  try {
    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    // 检查邮箱是否已存在
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: '该邮箱已被注册' });
    }

    // 创建新用户
    const user = await User.create({ username, email, password });

    // 生成JWT令牌
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: '注册成功',
      user,
      token
    });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({ message: '服务器错误，请稍后重试' });
  }
};

/**
 * 用户登录
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.login = async (req, res) => {
  try {
    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // 验证用户
    const user = await User.authenticate(email, password);
    if (!user) {
      return res.status(401).json({ message: '邮箱或密码不正确' });
    }

    // 生成JWT令牌
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: '登录成功',
      user,
      token
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ message: '服务器错误，请稍后重试' });
  }
};

/**
 * 刷新令牌
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.refreshToken = async (req, res) => {
    try {
        // 用户ID从认证中间件中获取
        const userId = req.user.id;
        
        // 查询用户信息
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: '用户不存在' });
        }
        
        // 生成新的令牌
        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );
        
        res.json({
            success: true,
            token
        });
    } catch (error) {
        logger.error(`刷新令牌失败: ${error.message}`);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
};