// 功能链接配置
const functionLinks = {
    home: '/',
    aiInquiry: 'https://bigmodel.cn/console/appcenter_v2/chat?app_id=1906595098901307392&from=experience',
    acupointAnalysis: 'https://www.d-d-d.cn/web3d/xuewei-allbody-userdemo/index-userdemo009.html',
    about: '/about',
    profile: '/profile'
};

let currentPage = 'home';
let history = [];
let showHistory = false;
let slideIndex = 0;
const slides = document.querySelectorAll('.swiper-slide');
const sidebarItems = document.querySelectorAll('.sidebar ul li');
const historyList = document.querySelector('.history-list');
const chevron = document.querySelector('.chevron');
const profileContent = document.querySelector('.profile-content');
const aboutContent = document.querySelector('.about-content');
const swiperContainer = document.querySelector('.swiper-container');
const functionImages = document.querySelector('.function-images');
const sidebar = document.getElementById('sidebar');
const mainContent = document.getElementById('mainContent');
let user = {}; // 用户信息对象

function showSlide(index) {
    // 淡出当前幻灯片
    slides.forEach(slide => {
        slide.style.opacity = '0';
        slide.querySelector('.slide-content').style.opacity = '0';
        slide.querySelector('.slide-title').style.opacity = '0';
        slide.querySelector('.slide-title').style.transform = 'translateY(20px)';
        slide.querySelector('.slide-subtitle').style.opacity = '0';
        slide.querySelector('.slide-subtitle').style.transform = 'translateY(20px)';
    });

    // 更新索引
    slideIndex = index;

    // 淡入新幻灯片
    setTimeout(() => {
        slides.forEach((slide, i) => {
            if (i === slideIndex) {
                slide.classList.add('active');
                slide.style.opacity = '1';

                // 图片放大效果
                const img = slide.querySelector('img');
                img.style.transform = 'scale(1.1)';

                // 延迟显示文字内容
                setTimeout(() => {
                    const content = slide.querySelector('.slide-content');
                    content.style.opacity = '1';
                    content.style.bottom = '25%';

                    setTimeout(() => {
                        const title = slide.querySelector('.slide-title');
                        title.style.opacity = '1';
                        title.style.transform = 'translateY(0)';

                        setTimeout(() => {
                            const subtitle = slide.querySelector('.slide-subtitle');
                            subtitle.style.opacity = '1';
                            subtitle.style.transform = 'translateY(0)';
                        }, 300);
                    }, 300);
                }, 300);
            } else {
                slide.classList.remove('active');
                // 重置非活动幻灯片的图片缩放
                const img = slide.querySelector('img');
                img.style.transform = 'scale(1)';
            }
        });
    }, 500);
}

function nextSlide() {
    showSlide((slideIndex + 1) % slides.length);
}

function prevSlide() {
    showSlide((slideIndex - 1 + slides.length) % slides.length);
}

function handleVisit(type, name) {
    currentPage = type;
    recordHistory(type, name);

    // 移除所有活动状态
    sidebarItems.forEach(item => item.classList.remove('active'));

    // 设置当前活动项
    const targetItem = document.querySelector(`li a[onclick="handleVisit('${type}', '${name}')"]`);
    if (targetItem) {
        targetItem.parentNode.classList.add('active');
    }

    // 显示相应内容
    if (type === 'home') {
        // 显示轮播图和功能图标
        swiperContainer.style.display = 'block';
        functionImages.style.display = 'flex';
        profileContent.style.display = 'none';
        aboutContent.style.display = 'none';
    } else if (type === 'profile') {
        // 显示个人中心
        profileContent.style.display = 'block';
        aboutContent.style.display = 'none';
        swiperContainer.style.display = 'none';
        functionImages.style.display = 'none';
    } else if (type === 'about') {
        // 显示关于我们
        aboutContent.style.display = 'block';
        profileContent.style.display = 'none';
        swiperContainer.style.display = 'none';
        functionImages.style.display = 'none';
    } else {
        // 打开外部链接
        window.open(functionLinks[type], '_blank');
    }
}

function recordHistory(type, name) {
    // 去重：相同类型只保留最新记录
    history = history.filter(item => item.type !== type);

    // 新增记录（倒序排列，最多10条）
    const newRecord = {
        type,
        name,
        url: functionLinks[type],
        time: new Date().toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        })
    };

    history.unshift(newRecord);
    if (history.length > 10) history.pop();

    // 保存到本地存储
    localStorage.setItem('history', JSON.stringify(history));

    // 更新历史记录显示
    if (showHistory) {
        updateHistoryList();
    }
}

function revisitHistory(element) {
    const record = {
        type: element.dataset.type,
        name: element.textContent.split(' - ')[1]
    };
    handleVisit(record.type, record.name);
    toggleHistory();
}

function clearHistory() {
    if (confirm('确认清除所有历史记录？')) {
        history = [];
        localStorage.removeItem('history');
        updateHistoryList();
    }
}

function toggleHistory() {
    showHistory = !showHistory;

    // 更新历史记录列表
    if (showHistory) {
        updateHistoryList();
        historyList.style.display = 'block';
        chevron.textContent = '▲';
    } else {
        historyList.style.display = 'none';
        chevron.textContent = '▼';
    }
}

function updateHistoryList() {
    // 清空列表，保留清除按钮
    while (historyList.firstChild) {
        if (historyList.firstChild.classList && historyList.firstChild.classList.contains('clear-btn')) {
            break;
        }
        historyList.removeChild(historyList.firstChild);
    }

    // 添加历史记录
    history.forEach(record => {
        const li = document.createElement('li');
        li.textContent = `${record.time} - ${record.name}`;
        li.dataset.type = record.type;
        li.onclick = function() {
            revisitHistory(this);
        };
        historyList.insertBefore(li, historyList.querySelector('.clear-btn'));
    });
}

// 退出登录
function logout() {
    if (confirm('确定退出登录？')) {
        // 清除本地存储中的登录状态和历史记录
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('history');
        // 跳转到注册登录界面
        window.location.href = 'index.html'; // 请根据实际情况修改登录页面的文件名
    }
}

function openContact() {
    alert('客服热线：400-888-8888\n服务时间：9:00-21:00');
}

function openNewWindow(type) {
    window.open(functionLinks[type], '_blank');
    recordHistory(type, type === 'aiInquiry' ? 'AI 问诊' : '穴位剖析');
}

function toggleSidebar() {
    sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('expanded');
}

function showTab(tabIndex) {
    // 隐藏所有标签内容
    document.querySelectorAll('.about-section').forEach(section => {
        section.classList.remove('active');
    });

    // 显示选中的标签内容
    document.getElementById(`tab${tabIndex}`).classList.add('active');

    // 更新标签样式
    document.querySelectorAll('.about-tab').forEach((tab, index) => {
        if (index === tabIndex) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
}

function submitForm() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;

    if (!name || !email || !subject || !message) {
        alert('请填写完整信息');
        return;
    }

    // 这里只是模拟提交，实际应用中应该发送到服务器
    alert('感谢您的留言！我们会尽快回复您。');

    // 清空表单
    document.getElementById('name').value = '';
    document.getElementById('email').value = '';
    document.getElementById('subject').value = '';
    document.getElementById('message').value = '';
}

// 个人中心标签切换
function showProfileTab(tabIndex) {
    // 隐藏所有标签内容
    document.querySelectorAll('.profile-section').forEach(section => {
        section.classList.remove('active');
    });

    // 显示选中的标签内容
    document.getElementById(`profileTab${tabIndex}`).classList.add('active');

    // 更新标签样式
    document.querySelectorAll('.profile-tab').forEach((tab, index) => {
        if (index === tabIndex) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
}

// 编辑个人资料
function editProfile() {
    alert('编辑个人资料功能将在后续版本中上线，敬请期待！');
}

// 修改密码
function changePassword() {
    alert('修改密码功能将在后续版本中上线，敬请期待！');
}

// 更换邮箱
function changeEmail() {
    alert('更换邮箱功能将在后续版本中上线，敬请期待！');
}

// 绑定手机
function bindPhone() {
    alert('绑定手机功能将在后续版本中上线，敬请期待！');
}

// 实名认证
function verifyIdentity() {
    alert('实名认证功能将在后续版本中上线，敬请期待！');
}

// 开启登录保护
function enableLoginProtection() {
    alert('登录保护功能将在后续版本中上线，敬请期待！');
}

// 初始化用户信息
function initUser() {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        user = JSON.parse(storedUser);
        updateUserDisplay();
    } else {
        // 默认用户信息（可替换为从后端获取）
        user = {
            username: '朋友',
            email: 'friend@nzy.com',
            id: 'user-123'
        };
    }
}

// 更新用户信息显示
function updateUserDisplay() {
    document.querySelector('.user-name').textContent = user.username;
    document.querySelector('.user-email').textContent = user.email;
}

// 编辑资料模态框
function editProfile() {
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-8">
            <h2 class="text-xl font-bold mb-4">编辑个人资料</h2>
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700">用户名</label>
                <input type="text" id="modalUsername" class="mt-1 block w-full rounded-md border-gray-300"
                       value="${user.username}" required>
            </div>
            <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700">邮箱</label>
                <input type="email" id="modalEmail" class="mt-1 block w-full rounded-md border-gray-300"
                       value="${user.email}" required>
            </div>
            <div class="flex justify-end">
                <button class="mr-4 px-4 py-2 bg-gray-300 rounded-md" onclick="closeModal()">取消</button>
                <button class="px-4 py-2 bg-primary text-white rounded-md" onclick="saveProfileChanges(this)">保存</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// 保存资料修改
function saveProfileChanges(btn) {
    const username = document.getElementById('modalUsername').value;
    const email = document.getElementById('modalEmail').value;

    if (!validateUsername(username)) {
        alert('用户名需为2-10位汉字或字母');
        return;
    }

    if (!validateEmail(email)) {
        alert('请输入正确的邮箱格式');
        return;
    }

    // 更新用户信息
    user.username = username;
    user.email = email;
    localStorage.setItem('user', JSON.stringify(user));
    updateUserDisplay();
    closeModal();
    alert('资料修改成功！');
}

// 关闭模态框
function closeModal() {
    const modal = document.querySelector('.fixed.bg-black');
    modal?.remove();
}

// 表单验证函数
function validateUsername(username) {
    return /^[a-zA-Z\u4e00-\u9fa5]{2,10}$/.test(username);
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// 初始化
function init() {
    initUser(); // 初始化用户信息
    // 加载历史记录
    const savedHistory = localStorage.getItem('history');
    if (savedHistory) {
        history = JSON.parse(savedHistory);
    }

    // 启动自动轮播
    let autoplayInterval = setInterval(nextSlide, 5000);

    // 鼠标悬停时暂停轮播
    swiperContainer.addEventListener('mouseenter', () => {
        clearInterval(autoplayInterval);
    });

    // 鼠标离开时恢复轮播
    swiperContainer.addEventListener('mouseleave', () => {
        autoplayInterval = setInterval(nextSlide, 5000);
    });

    // 显示第一张幻灯片
    showSlide(0);
}

// 页面加载时初始化
window.addEventListener('DOMContentLoaded', init);