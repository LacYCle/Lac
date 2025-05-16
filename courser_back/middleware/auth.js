/**
 * 认证中间件
 * 用于验证用户是否已登录
 */
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('警告: JWT_SECRET环境变量未设置，使用默认值可能存在安全风险');
}

// 验证用户是否已登录
const authenticate = (req, res, next) => {
  try {
    // 从请求头获取令牌
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: '未授权，请登录' });
    }
    
    // 验证令牌
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 将用户信息添加到请求对象
    req.user = decoded;
    
    next();
  } catch (error) {
    logger.error(`认证失败: ${error.message}`);
    return res.status(401).json({ message: '令牌无效或已过期，请重新登录' });
  }
};

module.exports = {
  authenticate,
  JWT_SECRET
};