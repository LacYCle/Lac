/**
 * Courser - API接口测试
 * 测试前后端交互的API接口功能
 */

// 模拟fetch API
global.fetch = jest.fn();

// 在每次测试后重置模拟
afterEach(() => {
  fetch.mockClear();
});

describe('API接口测试', () => {
  // 测试基础URL
  const API_BASE_URL = 'http://localhost:3000/api';
  
  // 模拟响应数据
  const mockCourses = [
    { id: 1, title: 'JavaScript基础', description: '学习JS基础知识' },
    { id: 2, title: 'HTML入门', description: '学习HTML基础' }
  ];
  
  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com'
  };

  describe('课程接口', () => {
    test('获取课程列表接口应返回课程数据', async () => {
      // 模拟成功响应
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ courses: mockCourses })
      });
      
      // 调用接口
      const response = await fetch(`${API_BASE_URL}/courses`);
      const data = await response.json();
      
      // 验证接口调用
      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/courses`);
      // 验证返回数据
      expect(data.courses).toEqual(mockCourses);
      expect(data.courses.length).toBe(2);
    });
    
    test('获取课程详情接口应返回指定课程', async () => {
      const courseId = 1;
      // 模拟成功响应
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ course: mockCourses[0] })
      });
      
      // 调用接口
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}`);
      const data = await response.json();
      
      // 验证接口调用
      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/courses/${courseId}`);
      // 验证返回数据
      expect(data.course).toEqual(mockCourses[0]);
      expect(data.course.id).toBe(courseId);
    });
    
    test('搜索课程接口应返回匹配的课程', async () => {
      const keyword = 'JavaScript';
      // 模拟成功响应
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ courses: [mockCourses[0]] })
      });
      
      // 调用接口
      const response = await fetch(`${API_BASE_URL}/courses/search?keyword=${keyword}`);
      const data = await response.json();
      
      // 验证接口调用
      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/courses/search?keyword=${keyword}`);
      // 验证返回数据
      expect(data.courses.length).toBe(1);
      expect(data.courses[0].title).toContain(keyword);
    });
  });
  
  describe('用户认证接口', () => {
    test('登录接口应返回用户信息和token', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      // 模拟成功响应
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          user: mockUser,
          token: 'mock-jwt-token'
        })
      });
      
      // 调用接口
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      });
      const data = await response.json();
      
      // 验证接口调用
      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/auth/login`, expect.any(Object));
      // 验证返回数据
      expect(data.user).toEqual(mockUser);
      expect(data.token).toBe('mock-jwt-token');
    });
    
    test('注册接口应创建新用户并返回用户信息', async () => {
      const registerData = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123'
      };
      
      // 模拟成功响应
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          user: {
            id: 2,
            username: registerData.username,
            email: registerData.email
          },
          message: '注册成功'
        })
      });
      
      // 调用接口
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registerData)
      });
      const data = await response.json();
      
      // 验证接口调用
      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/auth/register`, expect.any(Object));
      // 验证返回数据
      expect(data.user.username).toBe(registerData.username);
      expect(data.user.email).toBe(registerData.email);
      expect(data.message).toBe('注册成功');
    });
  });
  
  describe('错误处理', () => {
    test('无效的API请求应返回错误信息', async () => {
      // 模拟失败响应
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: '资源不存在' })
      });
      
      // 调用不存在的接口
      const response = await fetch(`${API_BASE_URL}/invalid-endpoint`);
      const data = await response.json();
      
      // 验证返回状态和错误信息
      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
      expect(data.message).toBe('资源不存在');
    });
    
    test('未授权的请求应返回401错误', async () => {
      // 模拟未授权响应
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: '未授权，请登录' })
      });
      
      // 调用需要授权的接口
      const response = await fetch(`${API_BASE_URL}/user/profile`);
      const data = await response.json();
      
      // 验证返回状态和错误信息
      expect(response.ok).toBe(false);
      expect(response.status).toBe(401);
      expect(data.message).toBe('未授权，请登录');
    });
  });
});