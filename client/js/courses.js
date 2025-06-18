/**
 * Courser - 在线网课学习平台
 * 课程管理模块
 */

const CourseManager = {
    // 课程数据
    courses: [],
    favorites: [],
    watchedCourses: [],
    currentFilter: 'all',
    
    // 初始化课程管理模块
    init: function() {
        Logger.info('初始化课程管理模块');
        
        // 绑定事件
        this.bindEvents();
        
        // 从本地存储加载收藏和已观看数据
        this.loadUserData();
        
        // 加载课程数据
        this.loadCourses();
    },
    
    // 加载课程数据
    loadCourses: function() {
        // 检查用户是否已登录
        if (!UserAuth.isLoggedIn()) {
            // 用户未登录，显示提示信息
            const coursesList = document.getElementById('coursesList');
            if (coursesList) {
                coursesList.innerHTML = `
                    <div class="col-12 text-center py-5">
                        <i class="fas fa-lock text-muted mb-3" style="font-size: 3rem;"></i>
                        <h4 class="text-muted">暂无课程</h4>
                    </div>
                `;
            }
            return;
        }
        
        // 用户已登录，显示加载状态
        showLoadingMessage('正在加载课程数据...');
        
        // 调用API获取课程列表
        API.courses.getList()
            .then(data => {
                // 设置课程数据并渲染
                this.setCourses(data.courses || []);
                
                // 隐藏加载状态
                hideLoadingMessage();
                
                Logger.info('课程数据加载成功');
            })
            .catch(error => {
                hideLoadingMessage();
                showErrorMessage(`加载课程失败: ${error.message}`);
                Logger.error('加载课程数据失败', error);
            });
    },
    
    // 绑定事件处理
    bindEvents: function() {
        // 课程筛选下拉菜单
        const filterItems = document.querySelectorAll('#courseFilterDropdown + .dropdown-menu .dropdown-item');
        filterItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const filter = e.target.textContent.trim();
                this.filterCourses(filter);
            });
        });
        
        // 搜索按钮
        document.getElementById('searchButton').addEventListener('click', () => {
            const query = document.getElementById('searchInput').value.trim();
            this.getRecommendations(query);
        });
        
        // 搜索输入框回车事件
        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = e.target.value.trim();
                this.getRecommendations(query);
            }
        });
        
        // 上传课程表按钮
        document.getElementById('uploadSchedule').addEventListener('click', () => {
            $('#uploadModal').modal('show');
        });
        
        // 文件选择变化事件
        document.getElementById('scheduleFile').addEventListener('change', this.handleFileSelect.bind(this));
        
        // 确认上传按钮
        document.getElementById('confirmUpload').addEventListener('click', this.handleFileUpload.bind(this));
    },
    
    // 加载用户数据（收藏和已观看）
    loadUserData: function() {
        try {
            // 从本地存储加载收藏数据
            const savedFavorites = localStorage.getItem('userFavorites');
            if (savedFavorites) {
                // 确保所有ID都是数字类型
                this.favorites = JSON.parse(savedFavorites).map(id => parseInt(id));
            }
            
            // 从本地存储加载已观看数据
            const savedWatched = localStorage.getItem('userWatchedCourses');
            if (savedWatched) {
                // 确保所有ID都是数字类型
                this.watchedCourses = JSON.parse(savedWatched).map(id => parseInt(id));
            }
            
            Logger.info('用户课程数据加载成功');
        } catch (error) {
            Logger.error('加载用户课程数据失败', error);
        }
    },
    
    // 保存用户数据（收藏和已观看）
    saveUserData: function() {
        try {
            // 确保所有ID都是数字类型
            const favorites = this.favorites.map(id => parseInt(id));
            const watchedCourses = this.watchedCourses.map(id => parseInt(id));
            
            localStorage.setItem('userFavorites', JSON.stringify(favorites));
            localStorage.setItem('userWatchedCourses', JSON.stringify(watchedCourses));
        } catch (error) {
            Logger.error('保存用户课程数据失败', error);
        }
    },
    
    // 设置课程数据
    setCourses: function(courses) {
        this.courses = courses;
        this.renderCourses();
        this.renderFavorites();
    },
    
    // 渲染课程列表
    renderCourses: function() {
        const coursesList = document.getElementById('coursesList');
        coursesList.innerHTML = '';
        
        let filteredCourses = this.courses;
        
        // 应用筛选
        if (this.currentFilter === '最新上线') {
            filteredCourses = [...this.courses];
        } else if (this.currentFilter === '最受欢迎') {
            filteredCourses = [...this.courses];
        } else if (this.currentFilter === '已观看') {
            filteredCourses = this.courses.filter(course => this.watchedCourses.includes(course.id));
        }
        
        if (filteredCourses.length === 0) {
            coursesList.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-book text-muted mb-3" style="font-size: 3rem;"></i>
                    <h4 class="text-muted">没有找到符合条件的课程</h4>
                </div>
            `;
            return;
        }
        
        filteredCourses.forEach(course => {
            const courseCard = document.createElement('div');
            courseCard.className = 'col-md-6 col-lg-4 fade-in';
            courseCard.innerHTML = `
                <div class="card course-card">
                    <div class="card-body">
                        <h5 class="card-title">${course.title}</h5>
                        <div class="course-info">
                            <span><i class="fas fa-user mr-1"></i>${course.teacher || '未知教师'}</span>
                        </div>
                        <div class="course-actions mt-3 d-flex justify-content-end"> <!-- 添加d-flex和justify-content-end类 -->
                            <button class="btn btn-primary btn-sm recommend-course" data-id="${course.id}" data-title="${course.title}">
                                <i class="fas fa-search mr-1"></i>查看推荐
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            coursesList.appendChild(courseCard);
        });
        
        // 绑定课程卡片事件
        this.bindCourseCardEvents();
    },
    
    // 渲染收藏列表
    renderFavorites: function() {
        const favoritesList = document.getElementById('favoritesList');
        const emptyFavorites = document.getElementById('emptyFavorites');
        
        // 如果元素不存在，可能是在推荐页面，直接返回
        if (!favoritesList || !emptyFavorites) {
            return;
        }
        
        // 调试输出，帮助排查问题
        console.log('当前收藏ID列表:', this.favorites);
        console.log('当前课程列表:', this.courses.map(c => ({id: c.id, title: c.title})));
        
        // 筛选出收藏的课程 - 确保ID类型一致
        const favoriteCourses = this.courses.filter(course => 
            course.id && this.favorites.some(id => parseInt(id) === parseInt(course.id))
        );
        
        console.log('筛选后的收藏课程:', favoriteCourses.map(c => ({id: c.id, title: c.title})));
        
        // 如果没有收藏，显示空状态
        if (this.favorites.length === 0 || favoriteCourses.length === 0) {
            favoritesList.innerHTML = '';
            emptyFavorites.classList.remove('d-none');
            return;
        }
        
        // 隐藏空状态
        emptyFavorites.classList.add('d-none');
        favoritesList.innerHTML = '';
        
        // 渲染收藏课程
        favoriteCourses.forEach(course => {
            const courseCard = document.createElement('div');
            courseCard.className = 'col-md-6 col-lg-4 mb-4';
            courseCard.innerHTML = `
                <div class="card course-card" data-id="${course.id}">
                    <span class="favorite-badge"><i class="fas fa-heart mr-1"></i>已收藏</span>
                    <div class="card-cover">
                        <h5 class="cover-title">${course.title}</h5>
                    </div>
                    <div class="card-body">
                        <div class="course-info mb-2">
                            <span><i class="fas fa-user mr-1"></i>${course.uploader || '未知作者'}</span>
                        </div>
                        <p class="card-text text-muted small">${course.description || '暂无描述'}</p>
                        <div class="course-stats small text-muted mb-3">
                            <span><i class="fas fa-play-circle stats-icon"></i>${course.play || 0}</span>
                            <span class="mx-2"><i class="fas fa-comment stats-icon"></i>${course.review || 0}</span>
                            <span><i class="fas fa-star stats-icon"></i>${course.favorites || 0}</span>
                        </div>
                        <div class="course-tags">
                            ${course.tag ? course.tag.split(',').map(tag => `<span class="badge badge-light mr-1">${tag.trim()}</span>`).join('') : ''}
                        </div>
                        <div class="course-actions">
                            <a href="${course.video_url}" target="_blank" class="btn btn-primary btn-sm">
                                <i class="fas fa-play-circle mr-1"></i>观看
                            </a>
                            <button class="btn btn-outline-danger btn-sm toggle-favorite" data-id="${course.id}">
                                <i class="fas fa-heart mr-1"></i>取消收藏
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            favoritesList.appendChild(courseCard);
        });
        
        // 绑定收藏课程卡片事件
        this.bindFavoriteCardEvents();
    },
    
    bindFavoriteCardEvents: function() {
        // 收藏按钮点击事件
        document.querySelectorAll('#favoritesList .toggle-favorite').forEach(button => {
            button.addEventListener('click', async (e) => {
                const courseId = parseInt(e.currentTarget.getAttribute('data-id'));
                this.toggleFavorite(courseId);
                
                // 获取要移除的卡片元素
                const card = e.currentTarget.closest('.col-md-6');
                
                // 添加收缩动画
                card.style.transition = 'all 0.3s ease-out';
                card.style.transform = 'scale(0.8)';
                card.style.opacity = '0';
                
                // 等待动画完成后更新收藏区域
                await new Promise(resolve => setTimeout(resolve, 300));
                this.renderFavorites();
                
                // 保存用户数据
                this.saveUserData();
            });
        });
    },
    
    // 绑定课程卡片事件
    bindCourseCardEvents: function() {
        // 推荐按钮点击事件
        document.querySelectorAll('.recommend-course').forEach(button => {
            button.addEventListener('click', (e) => {
                const courseId = parseInt(e.currentTarget.getAttribute('data-id'));
                const courseTitle = e.currentTarget.getAttribute('data-title');
                this.getRecommendations(courseTitle);
            });
        });
    },
    
    // 获取课程推荐
    getRecommendations: function(courseTitle) {
        // 显示加载状态
        showLoadingMessage('正在获取推荐课程...');
        
        // 调用API获取推荐
        API.videos.getRecommendations(courseTitle)
            .then(data => {
                // 保存推荐课程
                this.recommendedCourses = data.videos;
                
                // 渲染推荐页面
                this.renderRecommendationsPage(courseTitle);
                
                // 隐藏加载状态
                hideLoadingMessage();
            })
            .catch(error => {
                hideLoadingMessage();
                showErrorMessage(`获取推荐失败: ${error.message}`);
                Logger.error('获取课程推荐失败', error);
            });
    },
    
    // 渲染推荐页面
    renderRecommendationsPage: function(courseTitle) {
        // 隐藏其他页面
        document.getElementById('hero').classList.add('d-none');
        document.getElementById('courses').classList.add('d-none');
        document.getElementById('favorites').classList.add('d-none');
        
        // 如果推荐页面不存在，创建它
        let recommendationsSection = document.getElementById('recommendations');
        if (!recommendationsSection) {
            recommendationsSection = document.createElement('section');
            recommendationsSection.id = 'recommendations';
            recommendationsSection.className = 'py-5';
            document.querySelector('main').appendChild(recommendationsSection);
        }
        
        // 显示推荐页面
        recommendationsSection.classList.remove('d-none');
        
        // 渲染推荐内容
        recommendationsSection.innerHTML = `
            <div class="container">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2 class="section-title">"${courseTitle}" 的推荐课程</h2>
                    <button class="btn btn-outline-secondary" id="backToCoursesBtn">
                        <i class="fas fa-arrow-left mr-1"></i>返回课程列表
                    </button>
                </div>
                <div class="row" id="recommendationsList"></div>
            </div>
        `;
        
        // 绑定返回按钮事件
        document.getElementById('backToCoursesBtn').addEventListener('click', () => {
            this.showCoursesPage();
        });
        
        // 渲染推荐课程列表
        this.renderRecommendedCourses();
    },
    
    // 显示课程页面
    showCoursesPage: function() {
        // 隐藏推荐页面
        const recommendationsSection = document.getElementById('recommendations');
        if (recommendationsSection) {
            recommendationsSection.classList.add('d-none');
        }
        
        // 显示其他页面
        document.getElementById('hero').classList.remove('d-none');
        document.getElementById('courses').classList.remove('d-none');
        document.getElementById('favorites').classList.remove('d-none');
    },
    
    // 渲染推荐课程
    renderRecommendedCourses: function() {
        const recommendationsList = document.getElementById('recommendationsList');
        recommendationsList.innerHTML = '';
        
        if (!this.recommendedCourses || this.recommendedCourses.length === 0) {
            recommendationsList.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-search text-muted mb-3" style="font-size: 3rem;"></i>
                    <h4 class="text-muted">没有找到相关推荐课程</h4>
                </div>
            `;
            return;
        }
        
        this.recommendedCourses.forEach((course, index) => {
            // 修改判断逻辑，确保类型一致
            const isFavorite = course.id && this.favorites.some(id => parseInt(id) === parseInt(course.id));
            
            const courseCard = document.createElement('div');
            courseCard.className = 'col-md-6 col-lg-4 mb-4';
            courseCard.innerHTML = `
                <div class="card course-card">
                    ${isFavorite ? '<span class="favorite-badge"><i class="fas fa-heart mr-1"></i>已收藏</span>' : ''}
                    <div class="card-cover">
                        <h5 class="cover-title">${course.title}</h5>
                    </div>
                    <div class="card-body">
                        <div class="course-info mb-2">
                            <span><i class="fas fa-user mr-1"></i>${course.uploader || '未知作者'}</span>
                        </div>
                        <p class="card-text text-muted small">${course.description || '暂无描述'}</p>
                        <div class="course-stats small text-muted mb-3">
                            <span><i class="fas fa-play-circle stats-icon"></i>${course.play || 0}</span>
                            <span class="mx-2"><i class="fas fa-comment stats-icon"></i>${course.review || 0}</span>
                            <span><i class="fas fa-star stats-icon"></i>${course.favorites || 0}</span>
                        </div>
                        <div class="course-tags">
                            ${course.tag ? course.tag.split(',').map(tag => `<span class="badge badge-light mr-1">${tag.trim()}</span>`).join('') : ''}
                        </div>
                        <div class="course-actions">
                            <a href="${course.video_url}" target="_blank" class="btn btn-primary btn-sm">
                                <i class="fas fa-play-circle mr-1"></i>观看
                            </a>
                            <button class="btn btn-outline-${isFavorite ? 'danger' : 'secondary'} btn-sm toggle-favorite" data-index="${index}">
                                <i class="${isFavorite ? 'fas' : 'far'} fa-heart mr-1"></i>${isFavorite ? '取消收藏' : '收藏'}
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            recommendationsList.appendChild(courseCard);
        });
        
        // 绑定推荐课程卡片事件
        this.bindRecommendedCourseEvents();
    },
    
    // 绑定推荐课程卡片事件
    bindRecommendedCourseEvents: function() {
        // 收藏按钮点击事件
        document.querySelectorAll('#recommendationsList .toggle-favorite').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.getAttribute('data-index'));
                const course = this.recommendedCourses[index];
                
                // 确保课程有唯一ID
                if (!course.id) {
                    course.id = parseInt(Date.now() + Math.floor(Math.random() * 1000));
                } else {
                    course.id = parseInt(course.id);
                }
                
                // 将课程添加到课程列表中（确保在切换收藏状态前添加）
                if (!this.courses.some(c => parseInt(c.id) === course.id)) {
                    const courseCopy = JSON.parse(JSON.stringify(course));
                    this.courses.push(courseCopy);
                }
                
                this.toggleFavorite(course.id);
                
                // 保存用户数据
                this.saveUserData();
            });
        });
    },
    
    // 观看课程
    watchCourse: function(courseId) {
        const course = this.courses.find(c => c.id === courseId);
        if (!course) return;
        
        // 设置视频播放器
        document.getElementById('videoTitle').textContent = course.title;
        const videoPlayer = document.getElementById('videoPlayer');
        videoPlayer.src = course.videoUrl || '#';
        
        // 更新收藏和已观看按钮状态
        const favoriteButton = document.getElementById('favoriteButton');
        const markWatchedButton = document.getElementById('markWatchedButton');
        
        const isFavorite = this.favorites.includes(courseId);
        const isWatched = this.watchedCourses.includes(courseId);
        
        favoriteButton.innerHTML = `<i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i> ${isFavorite ? '取消收藏' : '收藏'}`;
        favoriteButton.classList.toggle('btn-outline-primary', !isFavorite);
        favoriteButton.classList.toggle('btn-primary', isFavorite);
        
        markWatchedButton.innerHTML = `<i class="${isWatched ? 'fas' : 'far'} fa-check-circle"></i> ${isWatched ? '取消标记' : '标记为已观看'}`;
        markWatchedButton.classList.toggle('btn-outline-secondary', !isWatched);
        markWatchedButton.classList.toggle('btn-secondary', isWatched);
        
        // 绑定视频模态框中的收藏和标记按钮事件
        favoriteButton.onclick = () => {
            this.toggleFavorite(courseId);
            const newIsFavorite = this.favorites.includes(courseId);
            favoriteButton.innerHTML = `<i class="${newIsFavorite ? 'fas' : 'far'} fa-heart"></i> ${newIsFavorite ? '取消收藏' : '收藏'}`;
            favoriteButton.classList.toggle('btn-outline-primary', !newIsFavorite);
            favoriteButton.classList.toggle('btn-primary', newIsFavorite);
        };
        
        markWatchedButton.onclick = () => {
            this.toggleWatched(courseId);
            const newIsWatched = this.watchedCourses.includes(courseId);
            markWatchedButton.innerHTML = `<i class="${newIsWatched ? 'fas' : 'far'} fa-check-circle"></i> ${newIsWatched ? '取消标记' : '标记为已观看'}`;
            markWatchedButton.classList.toggle('btn-outline-secondary', !newIsWatched);
            markWatchedButton.classList.toggle('btn-secondary', newIsWatched);
        };
        
        // 显示视频模态框
        $('#videoModal').modal('show');
        
        // 如果未标记为已观看，则自动标记
        if (!isWatched) {
            this.markAsWatched(courseId);
        }
    },
    
    // 切换收藏状态
    toggleFavorite: function(courseId) {
        courseId = parseInt(courseId);
        
        const index = this.favorites.findIndex(id => parseInt(id) === courseId);
        const course = this.recommendedCourses?.find(c => parseInt(c.id) === courseId) || this.courses.find(c => parseInt(c.id) === courseId);
        
        if (index === -1 && course) {
            // 添加到收藏
            this.favorites.push(courseId);
            // 确保课程数据被保存
            if (!this.courses.some(c => parseInt(c.id) === courseId)) {
                const courseCopy = JSON.parse(JSON.stringify(course));
                this.courses.push(courseCopy);
            }
            Logger.info(`课程 ID:${courseId} 已添加到收藏`);
        } else {
            // 从收藏中移除
            this.favorites.splice(index, 1);
            Logger.info(`课程 ID:${courseId} 已从收藏中移除`);
        }
        
        // 更新所有相关按钮的状态
        const isFavorite = this.favorites.some(id => parseInt(id) === courseId);
        document.querySelectorAll(`.toggle-favorite[data-id="${courseId}"], .toggle-favorite[data-index]`).forEach(button => {
            const index = button.getAttribute('data-index');
            if (index !== null) {
                const course = this.recommendedCourses[parseInt(index)];
                if (parseInt(course.id) === courseId) {
                    button.innerHTML = `<i class="${isFavorite ? 'fas' : 'far'} fa-heart mr-1"></i>${isFavorite ? '取消收藏' : '收藏'}`;
                    button.classList.toggle('btn-outline-danger', isFavorite);
                    button.classList.toggle('btn-outline-secondary', !isFavorite);
                }
            }
        });
        
        // 保存到本地存储
        this.saveUserData();
        
        // 重新渲染收藏列表
        this.renderFavorites();
    },
    
    
    // 切换已观看状态
    toggleWatched: function(courseId) {
        const index = this.watchedCourses.indexOf(courseId);
        
        if (index === -1) {
            // 添加到已观看
            this.markAsWatched(courseId);
        } else {
            // 从已观看中移除
            this.watchedCourses.splice(index, 1);
            Logger.info(`课程 ID:${courseId} 已从已观看列表中移除`);
            
            // 保存到本地存储
            this.saveUserData();
            
            // 重新渲染课程列表
            this.renderCourses();
            this.renderFavorites();
        }
    },
    
    // 标记为已观看
    markAsWatched: function(courseId) {
        if (!this.watchedCourses.includes(courseId)) {
            this.watchedCourses.push(courseId);
            Logger.info(`课程 ID:${courseId} 已标记为已观看`);
            
            // 保存到本地存储
            this.saveUserData();
            
            // 重新渲染课程列表
            this.renderCourses();
            this.renderFavorites();
        }
    },
    
    // 筛选课程
    filterCourses: function(filter) {
        this.currentFilter = filter;
        Logger.info(`应用课程筛选: ${filter}`);
        this.renderCourses();
    },
    
    // 搜索课程
    searchCourses: function(query) {
        if (!query) {
            // 如果搜索框为空，显示所有课程
            this.renderCourses();
            return;
        }
        
        Logger.info(`搜索课程: ${query}`);
        
        // 转换为小写以进行不区分大小写的搜索
        const lowerQuery = query.toLowerCase();
        
        // 筛选匹配的课程
        const searchResults = this.courses.filter(course => {
            return course.title.toLowerCase().includes(lowerQuery) || 
                   course.description.toLowerCase().includes(lowerQuery);
        });
        
        // 临时保存原始课程列表
        const originalCourses = this.courses;
        
        // 设置搜索结果并渲染
        this.courses = searchResults;
        this.renderCourses();
        
        // 恢复原始课程列表
        this.courses = originalCourses;
    },
    
    // 处理文件选择
    handleFileSelect: function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // 更新文件名显示
        const fileLabel = document.querySelector('.custom-file-label');
        fileLabel.textContent = file.name;
        
        // 检查文件类型
        const fileType = file.name.split('.').pop().toLowerCase();
        if (fileType !== 'csv' && fileType !== 'xls' && fileType !== 'xlsx') {
            showErrorMessage('不支持的文件格式。请上传 CSV 或 Excel 文件。');
            return;
        }
        
        // 显示文件预览
        const reader = new FileReader();
        reader.onload = (e) => {
            const filePreview = document.getElementById('filePreview');
            
            // 简单预览，实际应用中可能需要更复杂的解析
            if (fileType === 'csv') {
                const content = e.target.result;
                const lines = content.split('\n').slice(0, 5); // 只显示前5行
                
                let previewHtml = '<table class="table table-sm table-bordered mb-0">';
                lines.forEach((line, index) => {
                    const cells = line.split(',');
                    if (index === 0) {
                        previewHtml += '<thead><tr>';
                        cells.forEach(cell => {
                            previewHtml += `<th>${cell}</th>`;
                        });
                        previewHtml += '</tr></thead><tbody>';
                    } else {
                        previewHtml += '<tr>';
                        cells.forEach(cell => {
                            previewHtml += `<td>${cell}</td>`;
                        });
                        previewHtml += '</tr>';
                    }
                });
                previewHtml += '</tbody></table>';
                
                filePreview.innerHTML = previewHtml;
            } else {
                // Excel 文件预览需要额外的库，这里简化处理
                filePreview.innerHTML = `
                    <div class="text-center">
                        <i class="fas fa-file-excel text-success" style="font-size: 2rem;"></i>
                        <p class="mt-2 mb-0">${file.name}</p>
                        <small class="text-muted">Excel 文件已选择，点击上传按钮继续</small>
                    </div>
                `;
            }
        };
        
        if (fileType === 'csv') {
            reader.readAsText(file);
        } else {
            reader.readAsDataURL(file); // 对于 Excel 文件，我们只读取文件信息
        }
    },
    
    // 处理文件上传
    handleFileUpload: function() {
        const fileInput = document.getElementById('scheduleFile');
        const file = fileInput.files[0];
        
        if (!file) {
            showErrorMessage('请先选择文件');
            return;
        }
        
        // 检查文件类型
        const fileType = file.name.split('.').pop().toLowerCase();
        if (fileType !== 'csv' && fileType !== 'xls' && fileType !== 'xlsx') {
            showErrorMessage('不支持的文件格式。请上传 CSV 或 Excel 文件。');
            return;
        }
        
        // 创建FormData对象
        const formData = new FormData();
        formData.append('file', file);
        
        // 显示上传状态
        const uploadButton = document.getElementById('confirmUpload');
        uploadButton.disabled = true;
        uploadButton.innerHTML = '<span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>上传中...';
        
        // 调用API上传文件
        API.courses.uploadSchedule(formData)
            .then(data => {
                // 上传成功
                uploadButton.disabled = false;
                uploadButton.innerHTML = '上传';
                
                // 关闭模态框
                $('#uploadModal').modal('hide');
                
                // 重置文件输入
                fileInput.value = '';
                document.querySelector('.custom-file-label').textContent = '选择文件...';
                document.getElementById('filePreview').innerHTML = '<p class="text-center text-muted mb-0">上传文件后显示预览</p>';
                
                // 显示成功消息
                showSuccessMessage('课程表上传成功！系统将自动为您推荐相关课程。');
                
                Logger.info('课程表上传成功');
                
                // 如果API返回了课程数据，可以直接显示
                if (data.courses && data.courses.length > 0) {
                    // 处理返回的课程数据，确保每个课程对象都有必要的字段
                    const processedCourses = data.courses.map(course => ({
                        id: course.id || Math.random().toString(36).substr(2, 9), // 如果没有id，生成一个随机id
                        title: course.title,
                        teacher: course.teacher || '未知教师', // 添加teacher字段
                        video_url: course.video_url || '#',
                        uploader: course.uploader || '未知作者'
                    }));
                    
                    this.courses = processedCourses;
                    this.renderCourses();
                }
            })
            .catch(error => {
                // 恢复按钮状态
                uploadButton.disabled = false;
                uploadButton.innerHTML = '上传';
                
                // 显示错误消息
                showErrorMessage(`上传失败: ${error.message}`);
                Logger.error('课程表上传失败', error);
                
                // 添加更详细的错误日志
                console.error('上传错误详情:', error);
            });
    }
};

// 显示错误消息
function showErrorMessage(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show fixed-top m-3';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="close" data-dismiss="alert">
            <span>&times;</span>
        </button>
    `;
    document.body.appendChild(alertDiv);
    
    // 3秒后自动关闭
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => alertDiv.remove(), 500);
    }, 3000);
}


// 导出模块（用于测试）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CourseManager;
}


// 显示加载消息
function showLoadingMessage(message) {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loadingMessage';
    loadingDiv.className = 'alert alert-info alert-dismissible fade show fixed-top m-3';
    loadingDiv.innerHTML = `
        <div class="d-flex align-items-center">
            <div class="spinner-border spinner-border-sm mr-2" role="status">
                <span class="sr-only">加载中...</span>
            </div>
            ${message}
        </div>
    `;
    document.body.appendChild(loadingDiv);
}

// 隐藏加载消息
function hideLoadingMessage() {
    const loadingDiv = document.getElementById('loadingMessage');
    if (loadingDiv) {
        loadingDiv.classList.remove('show');
        setTimeout(() => loadingDiv.remove(), 500);
    }
}

// 显示成功消息
function showSuccessMessage(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show fixed-top m-3';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="close" data-dismiss="alert">
            <span>&times;</span>
        </button>
    `;
    document.body.appendChild(alertDiv);
    
    // 3秒后自动关闭
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => alertDiv.remove(), 500);
    }, 3000);
}