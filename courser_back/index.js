/**
 * Courser 后端主应用
 * 集成所有控制器和中间件
 */
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { body } = require('express-validator');
const { testConnection, initDatabase } = require('./config/db');
const { authenticate } = require('./middleware/auth');
const { upload, handleUploadError } = require('./middleware/upload');
const logger = require('./utils/logger');

// 导入控制器
const courseController = require('./controllers/courseController');
const videoController = require('./controllers/videoController');
const authController = require('./controllers/authController'); // 添加这一行

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3000;

// 中间件配置
app.use(cors({
  origin: 'http://localhost:8080',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json()); // JSON解析中间件
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// 测试数据库连接并初始化
(async () => {
  try {
    const connected = await testConnection();
    if (connected) {
      await initDatabase();
      logger.info('数据库初始化成功');
    }
  } catch (error) {
    logger.error(`数据库初始化失败: ${error.message}`);
    process.exit(1);
  }
})();

// API路由

// 用户认证路由 - 移到这里
app.post('/api/auth/register', [
  body('username').notEmpty().withMessage('用户名不能为空'),
  body('email').isEmail().withMessage('邮箱格式不正确'),
  body('password').isLength({ min: 6 }).withMessage('密码至少需要6个字符')
], authController.register);

app.post('/api/auth/login', [
  body('email').isEmail().withMessage('邮箱格式不正确'),
  body('password').notEmpty().withMessage('密码不能为空')
], authController.login);

// 在用户认证路由部分添加
app.post('/api/auth/refresh-token', authenticate, authController.refreshToken);

// 课程相关路由
app.get('/api/courses', courseController.getCourses);
app.get('/api/courses/search', courseController.searchCourses);
app.get('/api/courses/:id', courseController.getCourseById);
app.post('/api/courses', authenticate, [
  body('title').notEmpty().withMessage('课程标题不能为空'),
  body('description').notEmpty().withMessage('课程描述不能为空')
], courseController.createCourse);
app.put('/api/courses/:id', authenticate, courseController.updateCourse);
app.delete('/api/courses/:id', authenticate, courseController.deleteCourse);

// 用户课程管理路由
app.get('/api/user/courses', authenticate, courseController.getUserCourses);
app.get('/api/user/favorites', authenticate, courseController.getFavoriteCourses);
app.post('/api/courses/:id/favorite', authenticate, courseController.addToFavorites);
app.delete('/api/courses/:id/favorite', authenticate, courseController.removeFromFavorites);
app.post('/api/courses/:id/watch', authenticate, courseController.updateWatchHistory);
app.get('/api/user/history', authenticate, courseController.getWatchHistory);

// 视频相关路由
app.get('/api/videos/search', videoController.searchVideos);
app.get('/api/videos/recommendations', videoController.getRecommendations);
app.get('/api/videos/popular', videoController.getPopularVideos);
app.get('/api/videos/latest', videoController.getLatestVideos);
// 视频详情路由
app.get('/api/videos/:videoId', videoController.getVideoDetails);
app.get('/api/videos/:videoId/:source', videoController.getVideoDetails);
app.post('/api/videos', authenticate, [
  body('title').notEmpty().withMessage('视频标题不能为空'),
  body('video_url').notEmpty().withMessage('视频URL不能为空'),
  body('source_id').notEmpty().withMessage('视频源ID不能为空')
], videoController.saveVideo);

// 文件上传路由
// 在文件上传路由部分添加
const { parseFile } = require('./services/fileParserService');

// 课程表上传路由
app.post('/api/courses/upload', authenticate, upload.single('file'), handleUploadError, async (req, res) => {
  try {
    // 添加请求信息日志
    logger.info(`收到文件上传请求: ${JSON.stringify({
      headers: req.headers['content-type'],
      file: req.file ? '存在' : '不存在'
    })}`);
    
    if (!req.file) {
      return res.status(400).json({ message: '未上传文件' });
    }
    
    // 添加更详细的日志
    logger.info(`文件上传成功: ${req.file.originalname}, 大小: ${req.file.size} 字节`);
    
    // 处理课程表文件
    // 解析课程表文件
    const parsedCourses = await parseFile(req.file.path);
    
    res.json({ 
      message: '课程表上传成功',
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        path: req.file.path,
        size: req.file.size
      },
      courses: parsedCourses // 返回解析后的课程数据
    });
  } catch (error) {
    logger.error(`处理课程表上传失败: ${error.message}`);
    logger.error(error.stack); // 添加错误堆栈信息
    res.status(500).json({ message: `服务器内部错误: ${error.message}` });
  }
});

// 404处理
app.use((req, res) => {
  res.status(404).json({ message: '请求的资源不存在' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  logger.error(`服务器错误: ${err.message}`);
  res.status(500).json({ message: '服务器内部错误' });
});

// 启动服务器
app.listen(PORT, () => {
  logger.info(`服务器运行在 http://localhost:${PORT}`);
});

module.exports = app;
app.get('/', (req, res) => {
  res.json({ message: 'Courser API服务运行中' });
});
