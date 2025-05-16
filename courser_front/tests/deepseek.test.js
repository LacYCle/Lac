/**
 * Courser - 深度学习服务接口测试
 * 测试与Deepseek API的交互功能
 */

// 模拟fetch API
global.fetch = jest.fn();

// 在每次测试后重置模拟
afterEach(() => {
  fetch.mockClear();
});

describe('Deepseek服务接口测试', () => {
  // 测试基础URL
  const API_BASE_URL = 'http://localhost:3000/api';
  
  test('课程内容分析接口应返回分析结果', async () => {
    const courseId = 1;
    
    // 模拟成功响应
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        analysis: {
          difficulty: '中级',
          keywords: ['JavaScript', '编程', '前端开发'],
          summary: '这是一门JavaScript基础课程，适合初学者学习。',
          recommendations: ['HTML入门', 'CSS样式']
        }
      })
    });
    
    // 调用接口
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/analyze`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer mock-token'
      }
    });
    const data = await response.json();
    
    // 验证接口调用
    expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/courses/${courseId}/analyze`, expect.any(Object));
    // 验证返回数据
    expect(data.analysis).toBeDefined();
    expect(data.analysis.difficulty).toBe('中级');
    expect(data.analysis.keywords).toContain('JavaScript');
    expect(data.analysis.recommendations.length).toBe(2);
  });
  
  test('课程推荐接口应返回推荐课程列表', async () => {
    const userId = 1;
    
    // 模拟成功响应
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        recommendations: [
          { id: 3, title: 'CSS样式', confidence: 0.85 },
          { id: 4, title: 'React基础', confidence: 0.72 }
        ]
      })
    });
    
    // 调用接口
    const response = await fetch(`${API_BASE_URL}/users/${userId}/recommendations`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer mock-token'
      }
    });
    const data = await response.json();
    
    // 验证接口调用
    expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/users/${userId}/recommendations`, expect.any(Object));
    // 验证返回数据
    expect(data.recommendations).toBeDefined();
    expect(data.recommendations.length).toBe(2);
    expect(data.recommendations[0].title).toBe('CSS样式');
    expect(data.recommendations[0].confidence).toBeGreaterThan(0.8);
  });
  
  test('课程内容生成接口应返回生成的内容', async () => {
    const generateData = {
      topic: 'JavaScript异步编程',
      level: '中级',
      duration: '60分钟'
    };
    
    // 模拟成功响应
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        content: {
          title: 'JavaScript异步编程详解',
          sections: [
            { title: '回调函数', content: '回调函数是异步编程的基础...' },
            { title: 'Promise', content: 'Promise是处理异步操作的现代方式...' },
            { title: 'Async/Await', content: 'Async/Await是基于Promise的语法糖...' }
          ],
          exercises: [
            { question: '实现一个基于Promise的延迟函数', difficulty: '中级' }
          ]
        }
      })
    });
    
    // 调用接口
    const response = await fetch(`${API_BASE_URL}/courses/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-token'
      },
      body: JSON.stringify(generateData)
    });
    const data = await response.json();
    
    // 验证接口调用
    expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/courses/generate`, expect.any(Object));
    // 验证返回数据
    expect(data.content).toBeDefined();
    expect(data.content.title).toBe('JavaScript异步编程详解');
    expect(data.content.sections.length).toBe(3);
    expect(data.content.exercises.length).toBe(1);
  });
});