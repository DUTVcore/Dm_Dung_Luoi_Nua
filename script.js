// ============================================
// PHẦN 1: QUẢN LÝ HÌNH NỀN (BACKGROUND)
// ============================================
const bgContainer = document.getElementById('bg-container');
const bgUrlInput = document.getElementById('bg-url-input');
const saveBgBtn = document.getElementById('save-bg-btn');
const resetBgBtn = document.getElementById('reset-bg-btn');

// Load hình nền đã lưu khi mở tab
const savedBgUrl = localStorage.getItem('myBackgroundUrl');
if (savedBgUrl) {
    applyBackground(savedBgUrl);
    bgUrlInput.value = savedBgUrl; // Điền sẵn vào input trong setting
}

// Hàm chính để áp dụng hình nền
function applyBackground(url) {
    bgContainer.innerHTML = ''; // Xóa nền cũ

    // Kiểm tra đơn giản xem là video hay ảnh dựa vào đuôi file
    // (Cách này không hoàn hảo 100% nhưng đủ dùng cho các link phổ biến)
    const isVideo = url.match(/\.(mp4|webm|ogg)($|\?)/i);

    let mediaElement;
    if (isVideo) {
        mediaElement = document.createElement('video');
        mediaElement.autoplay = true;
        mediaElement.loop = true;
        mediaElement.muted = true; // Video nền bắt buộc phải mute mới tự chạy được trên Chrome
    } else {
        mediaElement = document.createElement('img');
    }

    mediaElement.id = "bg-media";
    mediaElement.src = url;
    
    // Xử lý lỗi nếu link hỏng
    mediaElement.onerror = () => {
        // alert("Link hình nền bị lỗi rồi ông ơi!");
        // Có thể fallback về nền mặc định nếu muốn
    };

    bgContainer.appendChild(mediaElement);
}

// Sự kiện nút Lưu
saveBgBtn.addEventListener('click', () => {
    const url = bgUrlInput.value.trim();
    if (url) {
        localStorage.setItem('myBackgroundUrl', url);
        applyBackground(url);
        toggleModal(false); // Đóng setting sau khi lưu
    }
});

// Sự kiện nút Mặc định (Xóa nền)
resetBgBtn.addEventListener('click', () => {
    localStorage.removeItem('myBackgroundUrl');
    bgContainer.innerHTML = ''; // Về nền màu trơn
    bgUrlInput.value = "";
    toggleModal(false);
});


// ============================================
// PHẦN 2: QUẢN LÝ SETTING MODAL & TABS
// ============================================
const modal = document.getElementById('settings-modal');
const settingIcon = document.getElementById('setting-icon');
const closeModalBtn = document.getElementById('close-modal');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Hàm bật tắt modal
function toggleModal(show) {
    if (show) modal.classList.remove('hidden');
    else modal.classList.add('hidden');
}

// Mở modal khi click icon
settingIcon.addEventListener('click', () => toggleModal(true));
// Đóng modal khi click nút X
closeModalBtn.addEventListener('click', () => toggleModal(false));
// Đóng modal khi click ra vùng đen bên ngoài
modal.addEventListener('click', (e) => {
    if (e.target === modal) toggleModal(false);
});

// Xử lý chuyển Tab
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // 1. Xóa active cũ
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.add('hidden'));

        // 2. Active tab được chọn
        btn.classList.add('active');
        const targetId = btn.getAttribute('data-target');
        document.getElementById(targetId).classList.remove('hidden');
    });
});


// ============================================
// PHẦN 3: LOGIC CŨ (ĐỒNG HỒ & TODO LIST)
// (Giữ nguyên không đổi)
// ============================================
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('clock').innerText = timeString;
}
setInterval(updateTime, 1000);
updateTime();

const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const savedTasks = JSON.parse(localStorage.getItem('myTasks')) || [];
renderTasks();

taskInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter' && taskInput.value.trim() !== "") {
        savedTasks.push(taskInput.value);
        saveAndRender();
        taskInput.value = "";
    }
});

function saveAndRender() {
    localStorage.setItem('myTasks', JSON.stringify(savedTasks));
    renderTasks();
}

function renderTasks() {
    taskList.innerHTML = "";
    savedTasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.textContent = task;
        li.onclick = () => {
            savedTasks.splice(index, 1);
            saveAndRender();
        };
        taskList.appendChild(li);
    });
}