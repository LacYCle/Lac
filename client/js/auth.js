/**
 * Courser - 在线网课学习平台
 * 用户认证模块
 */

const UserAuth = {
    // 当前用户信息
    currentUser: null,
    
    // 初始化认证模块
    init: function() {
        Logger.info('初始化用户认证模块');
        
        // 检查本地存储中是否有用户会话
        this.checkSession();
        
        // 绑定登录表单提交事件
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', this.handleLogin.bind(this));
        }
        
        // 绑定注册表单提交事件
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', this.handleRegister.bind(this));
        }
        
        // 绑定退出登录事件
        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) {
            logoutButton.addEventListener('click', this.handleLogout.bind(this));
        }
    },
    
    // 检查用户会话
    checkSession: function() {
        try {
            const userSession = localStorage.getItem('userSession');
            if (userSession) {
                this.currentUser = JSON.parse(userSession);
                this.updateUIForLoggedInUser();
                Logger.info(`用户 ${this.currentUser.username} 已登录`);
            } else {
                this.updateUIForLoggedOutUser();
            }
        } catch (error) {
            Logger.error('检查用户会话失败', error);
            localStorage.removeItem('userSession');
            this.updateUIForLoggedOutUser();
        }
    },
    
    // 处理登录表单提交
    handleLogin: function(event) {
        event.preventDefault();
        
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        if (!email || !password) {
            showErrorMessage('邮箱和密码不能为空');
            return;
        }
        
        // 显示加载状态
        const submitButton = event.target.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>登录中...';
        
        // 调用API登录
        API.user.login({ email, password })
            .then(data => {
                // 保存用户信息和token
                const user = {
                    ...data.user,
                    token: data.token,
                    rememberMe: rememberMe
                };
                
                this.currentUser = user;
                localStorage.setItem('userSession', JSON.stringify(user));
                
                this.updateUIForLoggedInUser();
                $('#loginModal').modal('hide');
                
                Logger.info(`用户 ${user.username} 登录成功`);
                showSuccessMessage(`欢迎回来，${user.username}！`);
            })
            .catch(error => {
                Logger.error('登录失败', error);
                showErrorMessage('登录失败：' + error.message);
            })
            .finally(() => {
                // 恢复按钮状态
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
            });
    },
    
    // 处理注册表单提交
    handleRegister: function(event) {
        event.preventDefault();
        
        const username = document.getElementById('registerUsername').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;
        
        // 验证表单
        if (!username || !email || !password) {
            showErrorMessage('所有字段都是必填的');
            return;
        }
        
        if (password !== confirmPassword) {
            showErrorMessage('两次输入的密码不一致');
            return;
        }
        
        if (!agreeTerms) {
            showErrorMessage('请同意服务条款和隐私政策');
            return;
        }
        
        // 显示加载状态
        const submitButton = event.target.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>注册中...';
        
        // 调用API注册
        API.user.register({ username, email, password })
            .then(data => {
                // 保存用户信息和token
                const user = {
                    ...data.user,
                    token: data.token
                };
                
                this.currentUser = user;
                localStorage.setItem('userSession', JSON.stringify(user));
                
                this.updateUIForLoggedInUser();
                $('#registerModal').modal('hide');
                
                Logger.info(`用户 ${user.username} 注册成功`);
                showSuccessMessage(`注册成功！欢迎加入 Courser，${user.username}！`);
            })
            .catch(error => {
                Logger.error('注册失败', error);
                showErrorMessage('注册失败：' + error.message);
            })
            .finally(() => {
                // 恢复按钮状态
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
            });
    },
    
    // 处理退出登录
    handleLogout: function() {
        try {
            const username = this.currentUser ? this.currentUser.username : '';
            
            localStorage.removeItem('userSession');
            this.currentUser = null;
            
            this.updateUIForLoggedOutUser();
            
            Logger.info(`用户 ${username} 已退出登录`);
            showSuccessMessage('您已成功退出登录');
        } catch (error) {
            Logger.error('退出登录失败', error);
        }
    },
    
    // 更新UI为已登录状态
    updateUIForLoggedInUser: function() {
        document.getElementById('authButtons').classList.add('d-none');
        document.getElementById('userProfile').classList.remove('d-none');
        document.getElementById('username').textContent = this.currentUser.username;
    },
    
    // 更新UI为未登录状态
    updateUIForLoggedOutUser: function() {
        document.getElementById('authButtons').classList.remove('d-none');
        document.getElementById('userProfile').classList.add('d-none');
    },
    
    // 检查用户是否已登录
    isLoggedIn: function() {
        return this.currentUser !== null;
    },
    
    // 处理会话过期
    handleSessionExpired: function() {
        // 显示会话过期提示
        showWarningMessage('您的登录会话已过期，请重新登录');
        
        // 清除本地存储中的会话信息
        localStorage.removeItem('userSession');
        this.currentUser = null;
        
        // 更新UI
        this.updateUIForLoggedOutUser();
        
        // 显示登录模态框
        $('#loginModal').modal('show');
    }
};

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

// 显示警告消息
function showWarningMessage(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-warning alert-dismissible fade show fixed-top m-3';
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
  module.exports = UserAuth;
}
