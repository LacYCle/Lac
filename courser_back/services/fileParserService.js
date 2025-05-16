/**
 * 文件解析服务
 * 用于解析上传的课程表文件
 */
const fs = require('fs').promises;
const path = require('path');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const { Readable } = require('stream');
const logger = require('../utils/logger');
const { parseCourseSchedule } = require('./deepseekService');

/**
 * 解析CSV文件
 * @param {string} filePath - 文件路径
 * @returns {Promise<Array>} - 解析后的数据
 */
async function parseCSV(filePath) {
  try {
    const results = [];
    const fileContent = await fs.readFile(filePath, 'utf8');
    
    // 使用Deepseek解析
    const parsedData = await parseCourseSchedule(fileContent, 'csv');
    return parsedData;
    
    // 如果Deepseek解析失败，使用传统方法解析
    /* 
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
          logger.info(`CSV文件解析完成，共${results.length}行数据`);
          resolve(results);
        })
        .on('error', (error) => {
          logger.error(`CSV文件解析错误: ${error.message}`);
          reject(error);
        });
    });
    */
  } catch (error) {
    logger.error(`CSV文件解析失败: ${error.message}`);
    throw new Error(`CSV文件解析失败: ${error.message}`);
  }
}

/**
 * 解析Excel文件
 * @param {string} filePath - 文件路径
 * @returns {Promise<Array>} - 解析后的数据
 */
async function parseExcel(filePath) {
  try {
    const fileBuffer = await fs.readFile(filePath);
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    
    // 获取第一个工作表
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // 转换为JSON
    const jsonData = xlsx.utils.sheet_to_json(worksheet);
    
    // 将Excel数据转换为字符串，用于Deepseek解析
    let excelContent = '';
    jsonData.forEach((row, index) => {
      excelContent += `行${index + 1}: ${JSON.stringify(row)}\n`;
    });
    
    // 使用Deepseek解析
    const parsedData = await parseCourseSchedule(excelContent, 'excel');
    return parsedData;
    
    /* 
    logger.info(`Excel文件解析完成，共${jsonData.length}行数据`);
    return jsonData;
    */
  } catch (error) {
    logger.error(`Excel文件解析失败: ${error.message}`);
    throw new Error(`Excel文件解析失败: ${error.message}`);
  }
}

/**
 * 根据文件类型解析文件
 * @param {string} filePath - 文件路径
 * @returns {Promise<Array>} - 解析后的数据
 */
/**
 * 根据文件类型解析文件
 * @param {string} filePath - 文件路径
 * @returns {Promise<Array>} - 解析后的数据
 */
async function parseFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  
  try {
    let fileContent;
    if (ext === '.csv') {
      fileContent = await fs.readFile(filePath, 'utf8');
      return await parseCourseSchedule(fileContent, 'csv');
    } else if (ext === '.xls' || ext === '.xlsx') {
      const fileBuffer = await fs.readFile(filePath);
      const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
      
      // 获取第一个工作表
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // 转换为JSON
      const jsonData = xlsx.utils.sheet_to_json(worksheet);
      
      // 将Excel数据转换为字符串，用于Deepseek解析
      let excelContent = '';
      jsonData.forEach((row, index) => {
        excelContent += `行${index + 1}: ${JSON.stringify(row)}\n`;
      });
      
      return await parseCourseSchedule(excelContent, 'excel');
    } else {
      throw new Error('不支持的文件类型');
    }
  } catch (error) {
    logger.error(`文件解析失败: ${error.message}`);
    throw error;
  }
}

module.exports = {
  parseFile
};
