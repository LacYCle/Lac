/**
 * Deepseek API 服务
 * 提供与Deepseek API交互的功能
 */
const { OpenAI } = require('openai');
const logger = require('../utils/logger');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Deepseek API密钥
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

// 创建OpenAI客户端实例
const openai = new OpenAI({
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  apiKey: DEEPSEEK_API_KEY
});

/**
 * 使用Deepseek解析课程表文件内容
 * @param {string} fileContent - 文件内容
 * @param {string} fileType - 文件类型 (csv, excel)
 * @returns {Promise<Array>} - 解析后的课程数据
 */
async function parseCourseSchedule(fileContent, fileType) {
  try {
    const completion = await openai.chat.completions.create({
      model: "qwen-plus",
      messages: [
        {
          role: "system",
          content: "你是一个专业的课程表解析助手，请帮我从课程表中提取出所有不重复的课程名称和教师名称，并以JSON格式返回。"
        },
        {
          role: "user",
          content: `这是一个${fileType === 'csv' ? 'CSV' : 'Excel'}格式的课程表文件内容：\n\n${fileContent}\n\n请提取出所有不同的课程（对于名称相同的课程只保留一项），并以JSON数组格式返回，每个课程包含title(课程名称)和teacher(教师姓名)字段。课程表中的信息通常按以下格式排列：课程名称、教师、上课时间、上课地点。请确保提取出的课程信息是准确的。`
        },
      ]
    });

    // 从响应中提取JSON数据
    const assistantMessage = completion.choices[0].message.content;
    logger.info(`Deepseek API返回的原始消息: ${assistantMessage}`); // 添加这一行
    
    // 尝试解析JSON
    try {
      // 查找JSON部分
      const jsonMatch = assistantMessage.match(/```json\n([\s\S]*?)\n```/) || 
                        assistantMessage.match(/\[([\s\S]*?)\]/) ||
                        assistantMessage;
      
      const jsonContent = jsonMatch[1] || assistantMessage;
      const courses = JSON.parse(jsonContent.includes('[') ? jsonContent : `[${jsonContent}]`);
      
      // 确保每个课程对象都有必要的字段
      const processedCourses = courses.map((course, index) => ({
        id: Date.now() + index,
        title: course.title || '未知课程',
        teacher: course.teacher || '未知教师'
      }));
      
      logger.info(`成功解析课程表，共${processedCourses.length}门课程`);
      return processedCourses;
    } catch (parseError) {
      logger.error(`解析Deepseek返回的JSON失败: ${parseError.message}`);
      throw new Error('无法解析课程数据，请检查文件格式');
    }
  } catch (error) {
    logger.error(`Deepseek API调用失败: ${error.message}`);
    throw new Error('课程表解析失败，请稍后重试');
  }
}

module.exports = {
    parseCourseSchedule
};