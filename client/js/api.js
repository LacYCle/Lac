/**
 * Courser - 在线网课学习平台
 * API服务模块
 */

const API = {
    // API基础URL
    baseUrl: 'http://localhost:3000/api',
    
    // 获取授权头信息
    getAuthHeaders: function(excludeContentType = false) {
        const headers = {};
        
        // 只在非文件上传请求时添加Content-Type
        if (!excludeContentType) {
            headers['Content-Type'] = 'application/json';
        }
        
        // 从会话存储中获取令牌
        const userSession = sessionStorage.getItem('userSession');
        if (userSession) {
            const user = JSON.parse(userSession);
            if (user && user.token) {
                headers['Authorization'] = `Bearer ${user.token}`;
            }
        }
        
        return headers;
    },
    
    // 刷新令牌
    refreshToken: async function() {
        try {
            // 检查是否有用户会话
            const userSession = sessionStorage.getItem('userSession');
            if (!userSession) {
                return false;
            }
            
            const user = JSON.parse(userSession);
            if (!user || !user.token) {
                return false;
            }
            
            // 调用刷新令牌API
            const response = await fetch(`${this.baseUrl}/auth/refresh-token`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            
            if (!response.ok) {
                return false;
            }
            
            const data = await response.json();
            if (!data.success || !data.token) {
                return false;
            }
            
            // 更新令牌
            user.token = data.token;
            sessionStorage.setItem('userSession', JSON.stringify(user));
            
            return true;
        } catch (error) {
            Logger.error('刷新令牌失败', error);
            return false;
        }
    },
    
    // 修改request方法，添加令牌刷新逻辑
    request: async function(endpoint, options = {}) {
        try {
            const url = `${this.baseUrl}${endpoint}`;
            
            // 默认请求选项
            const defaultOptions = {
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeaders()
                }
            };
            
            // 合并选项
            const fetchOptions = {
                ...defaultOptions,
                ...options,
                headers: {
                    ...defaultOptions.headers,
                    ...(options.headers || {})
                }
            };
            
            Logger.info(`API请求: ${options.method || 'GET'} ${url}`);
            
            // 发送请求
            let response = await fetch(url, fetchOptions);
            
            // 如果返回401未授权，尝试刷新令牌
            if (response.status === 401 && endpoint !== '/auth/refresh-token') {
                const refreshed = await this.refreshToken();
                if (refreshed) {
                    // 使用新令牌重试请求
                    fetchOptions.headers = {
                        ...fetchOptions.headers,
                        ...this.getAuthHeaders() // 获取新的令牌
                    };
                    response = await fetch(url, fetchOptions);
                } else {
                    // 刷新失败，可能需要重新登录
                    UserAuth.handleSessionExpired();
                }
            }
            
            console.log('响应状态:', response.status, response.statusText);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({
                    message: '请求失败'
                }));
                throw new Error(errorData.message || '请求失败');
            }
            
            // 如果是文件上传等非JSON响应，直接返回response
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }
            
            return response;
        } catch (error) {
            Logger.error(`API请求失败: ${error.message}`, error);
            throw error;
        }
    },
    
    // 课程相关接口
    courses: {
        // 获取课程列表
        async getList(params = {}) {
            const queryParams = new URLSearchParams(params).toString();
            const endpoint = `/courses${queryParams ? `?${queryParams}` : ''}`;
            return API.request(endpoint);
        },
        
        // 搜索课程
        async search(keyword, params = {}) {
            const queryParams = new URLSearchParams({
                keyword,
                ...params
            }).toString();
            return API.request(`/courses/search?${queryParams}`);
        },
        
        // 获取课程详情
        async getDetail(courseId) {
            return API.request(`/courses/${courseId}`);
        },
        
        // 创建课程
        async create(courseData) {
            return API.request('/courses', {
                method: 'POST',
                body: JSON.stringify(courseData)
            });
        },
        
        // 更新课程
        async update(courseId, courseData) {
            return API.request(`/courses/${courseId}`, {
                method: 'PUT',
                body: JSON.stringify(courseData)
            });
        },
        
        // 删除课程
        async delete(courseId) {
            return API.request(`/courses/${courseId}`, {
                method: 'DELETE'
            });
        },
        
        // 添加收藏
        async addFavorite(courseId) {
            return API.request(`/courses/${courseId}/favorite`, {
                method: 'POST'
            });
        },
        
        // 移除收藏
        async removeFavorite(courseId) {
            return API.request(`/courses/${courseId}/favorite`, {
                method: 'DELETE'
            });
        },
        
        
        // 上传课程表
        async uploadSchedule(formData) {
            const url = `${API.baseUrl}/courses/upload`;
            
            // 获取不包含Content-Type的授权头信息
            const authHeaders = API.getAuthHeaders(true);
            
            const fetchOptions = {
                method: 'POST',
                headers: authHeaders,
                body: formData
            };
            
            Logger.info(`API请求: POST ${url}`);
            
            try {
                await API.refreshToken();
                
                // 重新获取不包含Content-Type的授权头
                fetchOptions.headers = API.getAuthHeaders(true);
                
                const response = await fetch(url, fetchOptions);
                
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({
                        message: '请求失败'
                    }));
                    throw new Error(errorData.message || '请求失败');
                }
                
                return await response.json();
            } catch (error) {
                Logger.error(`文件上传失败: ${error.message}`, error);
                throw error;
            }
        }
    },
    
    // 用户相关接口
    // 在API.user对象中添加以下方法
    user: {
        // 登录
        async login(credentials) {
            return API.request('/auth/login', {
                method: 'POST',
                body: JSON.stringify(credentials)
            });
        },
        
        // 注册
        async register(userData) {
            return API.request('/auth/register', {
                method: 'POST',
                body: JSON.stringify(userData)
            });
        },
        
        // 获取我的课程
        async getMyCourses(params = {}) {
            const queryParams = new URLSearchParams(params).toString();
            const endpoint = `/user/courses${queryParams ? `?${queryParams}` : ''}`;
            return API.request(endpoint);
        },
        
        // 获取我的收藏
        async getFavorites(params = {}) {
            const queryParams = new URLSearchParams(params).toString();
            const endpoint = `/user/favorites${queryParams ? `?${queryParams}` : ''}`;
            return API.request(endpoint);
        },
        
        
        // 获取用户设置
        async getSettings() {
            return API.request('/user/settings');
        },
        
        // 更新用户设置
        async updateSettings(settingsData) {
            return API.request('/user/settings', {
                method: 'PUT',
                body: JSON.stringify(settingsData)
            });
        }
    },
    
    // 视频相关接口
    videos: {
        // 获取视频推荐
        async getRecommendations(keyword, limit = 10) {
            const queryParams = new URLSearchParams({
                keyword,
                limit
            }).toString();
            return API.request(`/videos/recommendations?${queryParams}`);
        },
        
        // 搜索视频
        async search(keyword, limit = 10) {
            const queryParams = new URLSearchParams({
                keyword,
                limit
            }).toString();
            return API.request(`/videos/search?${queryParams}`);
        },
        
        // 获取视频详情
        async getDetails(videoId, source = 'bilibili') {
            return API.request(`/videos/${videoId}/${source}`);
        }
    },
    
    // 文件上传接口
    upload: {
        // 上传文件
        async uploadFile(formData) {
            return API.request('/upload', {
                method: 'POST',
                headers: {
                    // 不设置Content-Type，让浏览器自动设置
                    ...API.getAuthHeaders()
                },
                body: formData
            });
        }
    }
};

// 导出模块（用于测试）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = API;
}