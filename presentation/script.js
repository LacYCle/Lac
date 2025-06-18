// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 初始化代码高亮
    hljs.highlightAll();
    
    // 初始化Mermaid图表
    mermaid.initialize({
        startOnLoad: true,
        theme: 'default',
        securityLevel: 'loose',
        flowchart: { useMaxWidth: false, htmlLabels: true }
    });
    
    // 处理章节折叠/展开功能
    const sectionHeaders = document.querySelectorAll('.section-header');
    sectionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const section = this.parentElement;
            const content = section.querySelector('.section-content');
            const toggleBtn = this.querySelector('.toggle-btn i');
            
            // 切换内容显示状态
            content.classList.toggle('collapsed');
            toggleBtn.classList.toggle('fa-chevron-down');
            toggleBtn.classList.toggle('fa-chevron-up');
            
            // 添加动画效果
            if (content.classList.contains('collapsed')) {
                content.style.maxHeight = '0';
            } else {
                content.style.maxHeight = content.scrollHeight + 'px';
            }
        });
    });
    
    // 处理代码块显示/隐藏功能
    const codeToggleBtns = document.querySelectorAll('.toggle-code-btn');
    const codeModal = document.getElementById('codeModal');
    const modalCodeContent = document.querySelector('.modal-code-content');
    const closeModal = document.querySelector('.close-modal');
    
    codeToggleBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation(); // 防止触发章节折叠
            
            const moduleCard = this.closest('.module-card');
            const codeBlock = moduleCard.querySelector('.code-block');
            const codeContent = codeBlock.querySelector('code').innerText;
            
            // 在模态框中显示代码
            modalCodeContent.textContent = codeContent;
            codeModal.style.display = 'block';
            hljs.highlightElement(modalCodeContent);
        });
    });
    
    // 关闭模态框
    closeModal.addEventListener('click', () => {
        codeModal.style.display = 'none';
    });
    
    // 点击模态框外部关闭
    window.addEventListener('click', (e) => {
        if (e.target === codeModal) {
            codeModal.style.display = 'none';
        }
    });
    
    // 处理代码标签切换
    const codeTabs = document.querySelectorAll('.code-tab');
    codeTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // 移除所有标签的活动状态
            const tabsContainer = this.parentElement;
            tabsContainer.querySelectorAll('.code-tab').forEach(t => {
                t.classList.remove('active');
            });
            
            // 隐藏所有代码面板
            const codeBlock = tabsContainer.closest('.code-block');
            codeBlock.querySelectorAll('.code-panel').forEach(panel => {
                panel.classList.remove('active');
            });
            
            // 激活当前标签和对应的代码面板
            this.classList.add('active');
            const targetId = this.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });
    
    // 平滑滚动到锚点
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            window.scrollTo({
                top: targetElement.offsetTop - 70, // 考虑导航栏高度
                behavior: 'smooth'
            });
        });
    });
    
    // 监听滚动事件，高亮当前导航项
    window.addEventListener('scroll', function() {
        const scrollPosition = window.scrollY;
        
        // 获取所有章节
        const sections = document.querySelectorAll('.section');
        
        // 找到当前滚动位置对应的章节
        let currentSection = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionBottom = sectionTop + section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                currentSection = '#' + section.id;
            }
        });
        
        // 更新导航高亮
        document.querySelectorAll('nav a').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === currentSection) {
                link.classList.add('active');
            }
        });
    });
    
    // 添加导航栏滚动效果
    window.addEventListener('scroll', function() {
        const nav = document.querySelector('.sticky-nav');
        if (window.scrollY > 100) {
            nav.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            nav.style.padding = '8px 0';
        } else {
            nav.style.boxShadow = 'none';
            nav.style.padding = '10px 0';
        }
    });
    
    // 初始状态：展开第一个章节，折叠其他章节
    const sections = document.querySelectorAll('.section');
    sections.forEach((section, index) => {
        const content = section.querySelector('.section-content');
        const toggleBtn = section.querySelector('.toggle-btn i');
        
        if (index === 0) {
            // 展开第一个章节
            content.classList.remove('collapsed');
            toggleBtn.classList.remove('fa-chevron-down');
            toggleBtn.classList.add('fa-chevron-up');
            content.style.maxHeight = content.scrollHeight + 'px';
        } else {
            // 折叠其他章节
            content.classList.add('collapsed');
            toggleBtn.classList.add('fa-chevron-down');
            toggleBtn.classList.remove('fa-chevron-up');
            content.style.maxHeight = '0';
        }
    });
});