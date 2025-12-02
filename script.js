/**
 * PROJECT: FOCUS TAB EXTENSION
 * Dev: DUTVcore
 * Description: Extension quản lý thời gian, task và giao diện cho sinh viên Bách Khoa.
 */

// ==========================================
// 1. KHỞI TẠO & CÁC BIẾN TOÀN CỤC
// ==========================================
const mainContainer = document.getElementById('main-container');
const dragHandle = document.getElementById('drag-handle');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');

// ==========================================
// 2. ĐỒNG HỒ SỐ & NGÀY THÁNG (Update từng giây)
// ==========================================
function updateClock() {
    const now = new Date();

    // 1. Hiển thị Giờ:Phút:Giây (00:00:00)
    const timeStr = now.toLocaleTimeString('vi-VN', { hour12: false });
    document.getElementById('clock').innerText = timeStr;

    // 2. Hiển thị Ngày tháng (Thứ Hai, 01 tháng 12 năm 2025)
    // Dùng Intl.DateTimeFormat để format tiếng Việt chuẩn
    const dateOption = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const dateStr = new Intl.DateTimeFormat('vi-VN', dateOption).format(now);
    document.getElementById('date-display').innerText = dateStr;
}
// Chạy ngay lập tức và lặp lại mỗi giây
updateClock();
setInterval(updateClock, 1000);


// ==========================================
// 3. TÍNH NĂNG KÉO THẢ (DRAG & DROP)
// ==========================================
// Load vị trí cũ từ LocalStorage
const savedPos = JSON.parse(localStorage.getItem('menuPosition'));
if (savedPos) {
    mainContainer.style.top = savedPos.top;
    mainContainer.style.left = savedPos.left;
    mainContainer.style.transform = "none"; // Bỏ căn giữa mặc định
}

let isDragging = false;
let startX, startY, initialLeft, initialTop;

// Sự kiện nhấn chuột vào nút tròn
dragHandle.addEventListener('mousedown', (e) => {
    isDragging = true;
    dragHandle.style.cursor = 'grabbing'; // Đổi con trỏ thành nắm tay

    // Tính toán vị trí bắt đầu
    startX = e.clientX;
    startY = e.clientY;
    
    // Lấy vị trí hiện tại của container
    const rect = mainContainer.getBoundingClientRect();
    initialLeft = rect.left;
    initialTop = rect.top;

    // Tắt transform mặc định để chuyển sang dùng top/left tuyệt đối
    mainContainer.style.transform = "none";
    mainContainer.style.left = initialLeft + "px";
    mainContainer.style.top = initialTop + "px";
});

// Sự kiện di chuyển chuột (trên toàn màn hình)
document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    // Tính khoảng cách đã di chuyển
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    // Cập nhật vị trí mới
    mainContainer.style.left = `${initialLeft + dx}px`;
    mainContainer.style.top = `${initialTop + dy}px`;
});

// Sự kiện thả chuột
document.addEventListener('mouseup', () => {
    if (isDragging) {
        isDragging = false;
        dragHandle.style.cursor = 'grab';

        // Lưu vị trí cuối cùng vào bộ nhớ
        const pos = {
            left: mainContainer.style.left,
            top: mainContainer.style.top
        };
        localStorage.setItem('menuPosition', JSON.stringify(pos));
    }
});


// ==========================================
// 4. QUẢN LÝ TODO LIST (AUTO RESET)
// ==========================================
// Kiểm tra ngày mới
const todayStr = new Date().toDateString();
const lastSavedDate = localStorage.getItem('lastSavedDate');
let savedTasks = JSON.parse(localStorage.getItem('myTasks')) || [];

if (lastSavedDate !== todayStr) {
    savedTasks = []; // Reset task nếu sang ngày mới
    localStorage.setItem('myTasks', JSON.stringify(savedTasks));
    localStorage.setItem('lastSavedDate', todayStr);
}

// Render danh sách
function renderTasks() {
    taskList.innerHTML = "";
    savedTasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.textContent = task;
        // Click để xóa
        li.onclick = () => {
            savedTasks.splice(index, 1);
            saveAndRender();
        };
        taskList.appendChild(li);
    });
}

function saveAndRender() {
    localStorage.setItem('myTasks', JSON.stringify(savedTasks));
    renderTasks();
}

// Bắt sự kiện Enter
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && taskInput.value.trim() !== "") {
        savedTasks.push(taskInput.value);
        saveAndRender();
        taskInput.value = "";
    }
});
// Khởi chạy lần đầu
renderTasks();


// ==========================================
// 5. CÀI ĐẶT GIAO DIỆN (ZOOM & FONT)
// ==========================================
const zoomRange = document.getElementById('zoom-range');
const fontSelect = document.getElementById('font-select');

// Load settings cũ
const savedZoom = localStorage.getItem('appZoom') || '1';
const savedFont = localStorage.getItem('appFont') || "'Segoe UI', sans-serif";

applySettings(savedZoom, savedFont);
zoomRange.value = savedZoom;
fontSelect.value = savedFont;

function applySettings(zoom, font) {
    document.body.style.fontFamily = font;
    // Scale container chính
    mainContainer.style.transform = `scale(${zoom})`;
    
    // *Lưu ý*: Nếu đang kéo thả (transform=none), logic này có thể bị ghi đè.
    // Để fix đơn giản: Ta scale font-size của root thay vì scale container
    // document.documentElement.style.fontSize = (16 * zoom) + "px"; 
    // Nhưng tạm thời dùng scale container cho dễ hiểu.
}

zoomRange.addEventListener('input', (e) => {
    const val = e.target.value;
    // Chỉ scale nếu không có style inline (tức là chưa kéo thả)
    // Hoặc update logic CSS để hỗ trợ cả 2 (nâng cao)
    mainContainer.style.transform = `scale(${val})`; 
    localStorage.setItem('appZoom', val);
});

fontSelect.addEventListener('change', (e) => {
    const val = e.target.value;
    document.body.style.fontFamily = val;
    localStorage.setItem('appFont', val);
});


// ==========================================
// 6. QUẢN LÝ HÌNH NỀN & MODAL
// ==========================================
const bgContainer = document.getElementById('bg-container');
const bgUrlInput = document.getElementById('bg-url-input');
const modal = document.getElementById('settings-modal');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Load Background
const savedBgUrl = localStorage.getItem('myBackgroundUrl');
if (savedBgUrl) { applyBackground(savedBgUrl); bgUrlInput.value = savedBgUrl; }

function applyBackground(url) {
    bgContainer.innerHTML = '';
    const isVideo = url.match(/\.(mp4|webm|ogg)($|\?)/i);
    let media;
    if (isVideo) {
        media = document.createElement('video');
        media.autoplay = true; media.loop = true; media.muted = true;
    } else {
        media = document.createElement('img');
    }
    media.id = "bg-media"; media.src = url;
    bgContainer.appendChild(media);
}

// Lưu Background
document.getElementById('save-bg-btn').addEventListener('click', () => {
    const url = bgUrlInput.value.trim();
    if(url) { 
        localStorage.setItem('myBackgroundUrl', url); 
        applyBackground(url); 
        toggleModal(false); 
    }
});

// Modal Logic
function toggleModal(show) { 
    show ? modal.classList.remove('hidden') : modal.classList.add('hidden'); 
}
document.getElementById('setting-icon').addEventListener('click', () => toggleModal(true));
document.getElementById('close-modal').addEventListener('click', () => toggleModal(false));
document.getElementById('reset-bg-btn').addEventListener('click', () => {
    localStorage.removeItem('myBackgroundUrl'); 
    bgContainer.innerHTML = ''; 
    toggleModal(false);
});

// Chuyển Tab
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.add('hidden'));
        btn.classList.add('active');
        document.getElementById(btn.getAttribute('data-target')).classList.remove('hidden');
    });
});