/**
 * 课程控制器
 * 处理课程相关的请求
 */
const Course = require('../models/Course');
const { validationResult } = require('express-validator');

/**
 * 获取课程列表
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getCourses = async (req, res) => {
  try {
    const { limit = 20, offset = 0, sortBy = 'created_at', sortOrder = 'DESC' } = req.query;
    
    console.log('正在获取课程列表，参数:', { limit, offset, sortBy, sortOrder });
    
    // 获取课程列表
    const courses = await Course.findAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      sortBy,
      sortOrder
    });

    console.log('成功获取课程列表，数量:', courses.length);
    res.json({ courses });
  } catch (error) {
    console.error('获取课程列表失败:', error.message, '\n堆栈:', error.stack);
    res.status(500).json({ message: '服务器错误，请稍后重试' });
  }
};

/**
 * 获取课程详情
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getCourseById = async (req, res) => {
  try {
    const courseId = req.params.id;
    
    // 获取课程详情
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: '课程不存在' });
    }
    
    // 如果用户已登录，获取收藏状态和观看状态
    if (req.user) {
      const userId = req.user.id;
      const isFavorite = await Course.isFavorite(userId, courseId);
      const watchStatus = await Course.getWatchStatus(userId, courseId);
      
      return res.json({
        course,
        isFavorite,
        watchStatus
      });
    }
    
    res.json({ course });
  } catch (error) {
    console.error('获取课程详情失败:', error);
    res.status(500).json({ message: '服务器错误，请稍后重试' });
  }
};

/**
 * 搜索课程
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.searchCourses = async (req, res) => {
  try {
    const { keyword, limit = 20, offset = 0 } = req.query;
    
    if (!keyword) {
      return res.status(400).json({ message: '搜索关键词不能为空' });
    }
    
    // 搜索课程
    const courses = await Course.search(keyword, {
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({ courses });
  } catch (error) {
    console.error('搜索课程失败:', error);
    res.status(500).json({ message: '服务器错误，请稍后重试' });
  }
};

/**
 * 创建课程
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.createCourse = async (req, res) => {
  try {
    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const userId = req.user.id;
    const courseData = {
      ...req.body,
      user_id: userId
    };
    
    // 创建课程
    const course = await Course.create(courseData);
    
    res.status(201).json({
      message: '课程创建成功',
      course
    });
  } catch (error) {
    console.error('创建课程失败:', error);
    res.status(500).json({ message: '服务器错误，请稍后重试' });
  }
};

/**
 * 更新课程
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.updateCourse = async (req, res) => {
  try {
    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const courseId = req.params.id;
    const userId = req.user.id;
    
    // 检查课程是否存在
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: '课程不存在' });
    }
    
    // 检查是否有权限更新（只有课程创建者可以更新）
    if (course.user_id !== userId) {
      return res.status(403).json({ message: '没有权限更新此课程' });
    }
    
    // 更新课程
    const updated = await Course.update(courseId, req.body);
    if (!updated) {
      return res.status(500).json({ message: '课程更新失败' });
    }
    
    res.json({ message: '课程更新成功' });
  } catch (error) {
    console.error('更新课程失败:', error);
    res.status(500).json({ message: '服务器错误，请稍后重试' });
  }
};

/**
 * 删除课程
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.deleteCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user.id;
    
    // 检查课程是否存在
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: '课程不存在' });
    }
    
    // 检查是否有权限删除（只有课程创建者可以删除）
    if (course.user_id !== userId) {
      return res.status(403).json({ message: '没有权限删除此课程' });
    }
    
    // 删除课程
    const deleted = await Course.delete(courseId);
    if (!deleted) {
      return res.status(500).json({ message: '课程删除失败' });
    }
    
    res.json({ message: '课程删除成功' });
  } catch (error) {
    console.error('删除课程失败:', error);
    res.status(500).json({ message: '服务器错误，请稍后重试' });
  }
};

/**
 * 获取用户创建的课程
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getUserCourses = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;
    
    // 获取用户创建的课程
    const courses = await Course.findByUserId(userId, {
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({ courses });
  } catch (error) {
    console.error('获取用户课程失败:', error);
    res.status(500).json({ message: '服务器错误，请稍后重试' });
  }
};

/**
 * 获取用户收藏的课程
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getFavoriteCourses = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;
    
    // 获取用户收藏的课程
    const courses = await Course.findFavoritesByUserId(userId, {
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({ courses });
  } catch (error) {
    console.error('获取收藏课程失败:', error);
    res.status(500).json({ message: '服务器错误，请稍后重试' });
  }
};

/**
 * 添加课程到收藏
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.addToFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const courseId = req.params.id;
    
    // 检查课程是否存在
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: '课程不存在' });
    }
    
    // 添加到收藏
    await Course.addToFavorites(userId, courseId);
    
    res.json({ message: '添加收藏成功' });
  } catch (error) {
    console.error('添加收藏失败:', error);
    res.status(500).json({ message: '服务器错误，请稍后重试' });
  }
};

/**
 * 从收藏中移除课程
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.removeFromFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const courseId = req.params.id;
    
    // 从收藏中移除
    const removed = await Course.removeFromFavorites(userId, courseId);
    if (!removed) {
      return res.status(404).json({ message: '该课程未被收藏' });
    }
    
    res.json({ message: '移除收藏成功' });
  } catch (error) {
    console.error('移除收藏失败:', error);
    res.status(500).json({ message: '服务器错误，请稍后重试' });
  }
};

/**
 * 更新观看历史
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.updateWatchHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const courseId = req.params.id;
    const { position, progress, watched } = req.body;
    
    // 检查课程是否存在
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: '课程不存在' });
    }
    
    // 更新观看历史
    await Course.updateWatchHistory(userId, courseId, position, progress, watched);
    
    res.json({ message: '观看历史更新成功' });
  } catch (error) {
    console.error('更新观看历史失败:', error);
    res.status(500).json({ message: '服务器错误，请稍后重试' });
  }
};

/**
 * 获取观看历史
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getWatchHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;
    
    // 获取观看历史
    const history = await Course.getWatchHistory(userId, {
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({ history });
  } catch (error) {
    console.error('获取观看历史失败:', error);
    res.status(500).json({ message: '服务器错误，请稍后重试' });
  }
};

// 上传课程表
exports.uploadCourseSchedule = async (req, res) => {
    try {
        const file = req.file;
        
        // 解析课程表文件
        const courses = await fileParserService.parseFile(file.path);
        
        // 批量保存到数据库
        const savedCourses = await Course.createBatch(courses);
        
        // 删除临时文件
        await fs.unlink(file.path);
        
        res.status(200).json({
            success: true,
            message: '课程表上传成功',
            data: savedCourses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '课程表上传失败',
            error: error.message
        });
    }
};