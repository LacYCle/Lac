/**
 * 验证工具
 * 提供各种输入验证函数
 */
const { body, validationResult } = require('express-validator');

// 用户注册验证规则
const registerValidationRules = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('用户名长度必须在3-30个字符之间')
    .matches(/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/)
    .withMessage('用户名只能包含字母、数字、下划线和中文'),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('请提供有效的电子邮箱地址')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('密码长度至少为6个字符')
    .matches(/\d/)
    .withMessage('密码必须包含至少一个数字')
];

// 用户登录验证规则
const loginValidationRules = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('请提供有效的电子邮箱地址')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('密码不能为空')
];

// 用户设置验证规则
const settingsValidationRules = [
  body('defaultQuality')
    .optional()
    .isIn(['1080', '720', '480'])
    .withMessage('默认画质必须是1080、720或480'),
  
  body('defaultSpeed')
    .optional()
    .isIn(['0.5', '1.0', '1.5', '2.0'])
    .withMessage('默认播放速度必须是0.5、1.0、1.5或2.0'),
  
  body('volumeLevel')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('音量必须在0-100之间'),
  
  body('autoplay')
    .optional()
    .isBoolean()
    .withMessage('自动播放必须是布尔值'),
  
  body('theme')
    .optional()
    .isIn(['light', 'dark', 'system'])
    .withMessage('主题必须是light、dark或system')
];

// 验证结果处理中间件
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

module.exports = {
  registerValidationRules,
  loginValidationRules,
  settingsValidationRules,
  validate
};