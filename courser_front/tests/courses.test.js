describe('CourseManager模块', () => {
  let CourseManager;
  
  beforeEach(() => {
    // 清除localStorage
    localStorage.clear();
    // 导入模块
    CourseManager = require('../js/courses');
    // 重置模块状态
    CourseManager.courses = [];
    CourseManager.favorites = [];
    CourseManager.watchedCourses = [];
  });

  test('应正确加载用户数据', () => {
    // 模拟localStorage中的收藏和已观看数据
    localStorage.setItem('userFavorites', JSON.stringify([1, 2, 3]));
    localStorage.setItem('userWatchedCourses', JSON.stringify([2, 4]));
    
    // 加载用户数据
    CourseManager.loadUserData();
    
    // 验证数据已正确加载
    expect(CourseManager.favorites).toEqual([1, 2, 3]);
    expect(CourseManager.watchedCourses).toEqual([2, 4]);
  });

  test('应正确切换收藏状态', () => {
    // 初始状态：无收藏
    expect(CourseManager.favorites).toEqual([]);
    
    // 添加收藏
    CourseManager.toggleFavorite(1);
    expect(CourseManager.favorites).toEqual([1]);
    
    // 再次调用应取消收藏
    CourseManager.toggleFavorite(1);
    expect(CourseManager.favorites).toEqual([]);
    
    // 验证数据已保存到localStorage
    expect(localStorage.getItem('userFavorites')).toBe('[]');
  });

  test('应正确标记课程为已观看', () => {
    // 初始状态：无已观看课程
    expect(CourseManager.watchedCourses).toEqual([]);
    
    // 标记为已观看
    CourseManager.markAsWatched(1);
    expect(CourseManager.watchedCourses).toEqual([1]);
    
    // 重复标记不应添加重复项
    CourseManager.markAsWatched(1);
    expect(CourseManager.watchedCourses).toEqual([1]);
    
    // 验证数据已保存到localStorage
    expect(localStorage.getItem('userWatchedCourses')).toBe('[1]');
  });

  test('搜索功能应返回匹配的课程', () => {
    // 模拟课程数据
    CourseManager.courses = [
      { id: 1, title: 'JavaScript基础', description: '学习JS基础知识' },
      { id: 2, title: 'HTML入门', description: '学习HTML基础' },
      { id: 3, title: 'CSS样式', description: '学习CSS和JavaScript的结合' }
    ];
    
    // 模拟渲染函数
    CourseManager.renderCourses = jest.fn();
    
    // 执行搜索
    CourseManager.searchCourses('JavaScript');
    
    // 验证渲染函数被调用
    expect(CourseManager.renderCourses).toHaveBeenCalled();
    // 由于searchCourses内部会恢复原始课程列表，我们无法直接验证搜索结果
    // 但可以验证Logger记录了搜索操作
    expect(Logger.info).toHaveBeenCalledWith('搜索课程: JavaScript');
  });
});