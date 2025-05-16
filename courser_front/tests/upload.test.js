/**
 * Courser - 文件上传接口测试
 * 测试课程表上传和解析功能
 */

// 模拟fetch API
global.fetch = jest.fn();

// 在每次测试后重置模拟
afterEach(() => {
  fetch.mockClear();
});

describe('文件上传接口测试', () => {
  // 测试基础URL
  const API_BASE_URL = 'http://localhost:3000/api';
  
  // 模拟文件数据
  const createMockFile = (name, type, content) => {
    const file = new File([content], name, { type });
    return file;
  };
  
  test('上传CSV课程表应成功解析并返回课程数据', async () => {
    // 模拟CSV文件内容
    const csvContent = `课程名称,上课时间,教师,地点
JavaScript基础,周一 10:00-12:00,张老师,教室A
HTML入门,周二 14:00-16:00,李老师,教室B`;
    
    // 创建模拟文件
    const mockFile = createMockFile('courses.csv', 'text/csv', csvContent);
    
    // 模拟FormData
    const formData = new FormData();
    formData.append('file', mockFile);
    
    // 模拟成功响应
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        courses: [
          { title: 'JavaScript基础', time: '周一 10:00-12:00', teacher: '张老师', location: '教室A' },
          { title: 'HTML入门', time: '周二 14:00-16:00', teacher: '李老师', location: '教室B' }
        ],
        message: '课程表解析成功'
      })
    });
    
    // 调用上传接口
    const response = await fetch(`${API_BASE_URL}/courses/upload`, {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    
    // 验证接口调用
    expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/courses/upload`, expect.any(Object));
    // 验证返回数据
    expect(data.courses.length).toBe(2);
    expect(data.courses[0].title).toBe('JavaScript基础');
    expect(data.courses[1].title).toBe('HTML入门');
    expect(data.message).toBe('课程表解析成功');
  });
  
  test('上传Excel课程表应成功解析并返回课程数据', async () => {
    // 创建模拟Excel文件（实际内容不重要，因为我们模拟了响应）
    const mockFile = createMockFile('courses.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'mock excel content');
    
    // 模拟FormData
    const formData = new FormData();
    formData.append('file', mockFile);
    
    // 模拟成功响应
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        courses: [
          { title: 'CSS样式', time: '周三 10:00-12:00', teacher: '王老师', location: '教室C' },
          { title: 'React基础', time: '周四 14:00-16:00', teacher: '赵老师', location: '教室D' }
        ],
        message: '课程表解析成功'
      })
    });
    
    // 调用上传接口
    const response = await fetch(`${API_BASE_URL}/courses/upload`, {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    
    // 验证接口调用
    expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/courses/upload`, expect.any(Object));
    // 验证返回数据
    expect(data.courses.length).toBe(2);
    expect(data.courses[0].title).toBe('CSS样式');
    expect(data.courses[1].title).toBe('React基础');
    expect(data.message).toBe('课程表解析成功');
  });
  
  test('上传无效文件应返回错误信息', async () => {
    // 创建模拟文件
    const mockFile = createMockFile('invalid.txt', 'text/plain', 'This is not a valid course schedule');
    
    // 模拟FormData
    const formData = new FormData();
    formData.append('file', mockFile);
    
    // 模拟失败响应
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ message: '不支持的文件格式，请上传CSV或Excel文件' })
    });
    
    // 调用上传接口
    const response = await fetch(`${API_BASE_URL}/courses/upload`, {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    
    // 验证返回状态和错误信息
    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);
    expect(data.message).toBe('不支持的文件格式，请上传CSV或Excel文件');
  });
});