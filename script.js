/**
 * PROJECT: FOCUS TAB EXTENSION - SAFE MODE
 * Dev: DUTVcore
 * Updated: Fixed crash logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. KHỞI TẠO BIẾN (DOM ELEMENTS)
    // ==========================================
    const mainContainer = document.getElementById('main-container');
    const dragHandle = document.getElementById('drag-handle');
    const taskInput = document.getElementById('taskInput');
    const taskList = document.getElementById('taskList');
    const recheckBtn = document.getElementById('recheck-btn');
    const listTitle = document.getElementById('list-title');
    const focusInput = document.getElementById('focus-input');
    const toggleFocusBtn = document.getElementById('toggle-focus-btn');
    
    // Settings Elements
    const settingIcon = document.getElementById('setting-icon');
    const modal = document.getElementById('settings-modal');
    const closeModal = document.getElementById('close-modal');
    const resetHourInput = document.getElementById('reset-hour-input');
    const saveSettingsBtn = document.getElementById('save-settings-btn');
    const zoomRange = document.getElementById('zoom-range');
    const fontSelect = document.getElementById('font-select');
    const bgContainer = document.getElementById('bg-container');
    const bgUrlInput = document.getElementById('bg-url-input');
    const saveBgBtn = document.getElementById('save-bg-btn');
    const resetBgBtn = document.getElementById('reset-bg-btn');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    // ==========================================
    // 2. XỬ LÝ MODAL & CÀI ĐẶT (QUAN TRỌNG: ĐƯA LÊN ĐẦU)
    // ==========================================
    function toggleModal(show) { 
        if (!modal) return;
        show ? modal.classList.remove('hidden') : modal.classList.add('hidden'); 
    }

    if (settingIcon) settingIcon.addEventListener('click', () => toggleModal(true));
    if (closeModal) closeModal.addEventListener('click', () => toggleModal(false));

    // Chuyển Tab trong Modal
    if (tabBtns) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.add('hidden'));
                btn.classList.add('active');
                const target = document.getElementById(btn.getAttribute('data-target'));
                if (target) target.classList.remove('hidden');
            });
        });
    }

    // ==========================================
    // 3. ĐỒNG HỒ SỐ & NGÀY THÁNG
    // ==========================================
    function updateClock() {
        const now = new Date();
        const clockEl = document.getElementById('clock');
        const dateEl = document.getElementById('date-display');
        
        if (clockEl) clockEl.innerText = now.toLocaleTimeString('vi-VN', { hour12: false });
        
        if (dateEl) {
            const dateOption = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
            dateEl.innerText = new Intl.DateTimeFormat('vi-VN', dateOption).format(now);
        }
    }
    updateClock();
    setInterval(updateClock, 1000);

    // ==========================================
    // 4. CÀI ĐẶT GIAO DIỆN (ZOOM & FONT)
    // ==========================================
    const savedZoom = localStorage.getItem('appZoom') || '1';
    const savedFont = localStorage.getItem('appFont') || "'Segoe UI', sans-serif";

    function applySettings(zoom, font) {
        document.body.style.fontFamily = font;
        if (mainContainer && mainContainer.style.transform !== "none") {
             mainContainer.style.transform = `scale(${zoom})`;
        } else if (mainContainer) {
            mainContainer.style.zoom = zoom;
        }
    }
    applySettings(savedZoom, savedFont);

    // if (zoomRange) {
    //     zoomRange.value = savedZoom;
    //     zoomRange.addEventListener('input', (e) => {
    //         applySettings(e.target.value, savedFont);
    //         localStorage.setItem('appZoom', e.target.value);
    //     });
    // }
// Tìm đoạn này trong script.js (Section 4)
    if (zoomRange) {
        zoomRange.value = savedZoom;
        // Cập nhật thêm dòng này để hiển thị số ban đầu
        const zoomValDisplay = document.getElementById('zoom-val'); 
        if(zoomValDisplay) zoomValDisplay.innerText = savedZoom;
    
        zoomRange.addEventListener('input', (e) => {
            applySettings(e.target.value, savedFont);
            localStorage.setItem('appZoom', e.target.value);
            // Cập nhật số khi kéo
            if(zoomValDisplay) zoomValDisplay.innerText = e.target.value;
        });
    }

    if (fontSelect) {
        fontSelect.value = savedFont;
        fontSelect.addEventListener('change', (e) => {
            applySettings(savedZoom, e.target.value);
            localStorage.setItem('appFont', e.target.value);
        });
    }

    // ==========================================
    // 5. CÀI ĐẶT GIỜ "CÚ ĐÊM"
    // ==========================================
    if (resetHourInput && saveSettingsBtn) {
        resetHourInput.value = localStorage.getItem('userResetHour') || 0;
        saveSettingsBtn.addEventListener('click', () => {
            const val = parseInt(resetHourInput.value);
            if (val >= 0 && val <= 23) {
                localStorage.setItem('userResetHour', val);
                alert(`Đã lưu! Reset task lúc ${val}h sáng.`);
                location.reload(); 
            } else {
                alert("Giờ không hợp lệ (0-23)");
            }
        });
    }

    // ==========================================
    // 6. QUẢN LÝ HÌNH NỀN
    // ==========================================
    const savedBgUrl = localStorage.getItem('myBackgroundUrl');
    if (savedBgUrl) { applyBackground(savedBgUrl); if(bgUrlInput) bgUrlInput.value = savedBgUrl; }

    function applyBackground(url) {
        if (!bgContainer) return;
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

    if (saveBgBtn && bgUrlInput) {
        saveBgBtn.addEventListener('click', () => {
            const url = bgUrlInput.value.trim();
            if(url) { 
                localStorage.setItem('myBackgroundUrl', url); 
                applyBackground(url); 
                toggleModal(false); 
            }
        });
    }

    if (resetBgBtn) {
        resetBgBtn.addEventListener('click', () => {
            localStorage.removeItem('myBackgroundUrl'); 
            if (bgContainer) bgContainer.innerHTML = ''; 
            toggleModal(false);
        });
    }

    // ==========================================
    // 7. LOGIC TASK & CÚ ĐÊM
    // ==========================================
    function getLogicalDateStr() {
        const resetHour = parseInt(localStorage.getItem('userResetHour')) || 0;
        const now = new Date();
        now.setHours(now.getHours() - resetHour);
        return now.toDateString(); 
    }

    const currentLogicDate = getLogicalDateStr();
    const lastLogicDate = localStorage.getItem('lastSavedDate');
    let todayTasks = JSON.parse(localStorage.getItem('myTasks')) || [];
    
    if (lastLogicDate !== currentLogicDate) {
        localStorage.setItem('yesterdayTasks', JSON.stringify(todayTasks));
        todayTasks = [];
        localStorage.setItem('myTasks', JSON.stringify(todayTasks));
        localStorage.setItem('lastSavedDate', currentLogicDate);
    }

    function renderCustomList(tasksArr, readOnly = false) {
        if (!taskList) return;
        taskList.innerHTML = "";
        if (tasksArr.length === 0) {
            taskList.innerHTML = "<li style='text-align:center; background:none; color: #a6adc8;'>Chưa có nhiệm vụ</li>";
            return;
        }
        tasksArr.forEach((task, index) => {
            const li = document.createElement('li');
            li.textContent = task;
            if (!readOnly) {
                li.onclick = () => { todayTasks.splice(index, 1); saveAndRender(); };
            } else {
                li.style.cursor = "default"; li.style.opacity = "0.7";
            }
            taskList.appendChild(li);
        });
    }

    function saveAndRender() {
        localStorage.setItem('myTasks', JSON.stringify(todayTasks));
        renderCustomList(todayTasks, false);
    }

    if (taskList) renderCustomList(todayTasks, false);

    if (taskInput) {
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && taskInput.value.trim() !== "") {
                todayTasks.push(taskInput.value);
                saveAndRender();
                taskInput.value = "";
            }
        });
    }

    // Nút Recheck
    let isViewingHistory = false;
    if (recheckBtn) {
        recheckBtn.addEventListener('click', () => {
            isViewingHistory = !isViewingHistory;
            recheckBtn.classList.toggle('active', isViewingHistory);
            
            if (isViewingHistory) {
                if(listTitle) {
                    listTitle.style.display = 'block';
                    listTitle.innerText = "Nhiệm vụ hôm qua:";
                    listTitle.style.color = "#a6adc8";
                }
                const oldTasks = JSON.parse(localStorage.getItem('yesterdayTasks')) || [];
                renderCustomList(oldTasks, true);
                if(document.querySelector('.input-group')) document.querySelector('.input-group').style.display = 'none';
            } else {
                if(listTitle) listTitle.style.display = 'none';
                renderCustomList(todayTasks, false);
                if(document.querySelector('.input-group')) document.querySelector('.input-group').style.display = 'flex';
            }
        });
    }

    // ==========================================
    // 8. FOCUS MODE
    // ==========================================
    if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.get(['focusModeStatus', 'focusDomain'], (result) => {
            if (result.focusModeStatus) activeFocusUI(true, result.focusDomain);
        });
    }

    if (toggleFocusBtn && focusInput) {
        toggleFocusBtn.addEventListener('click', () => {
            const isFocusing = toggleFocusBtn.classList.contains('focusing');
            if (!isFocusing) {
                let rawUrl = focusInput.value.trim();
                if (!rawUrl) return alert("Nhập link vào đã bro!");
                try {
                    if (!rawUrl.startsWith('http')) rawUrl = 'https://' + rawUrl;
                    const hostname = new URL(rawUrl).hostname;
                    if (typeof chrome !== 'undefined' && chrome.storage) {
                        chrome.storage.local.set({ focusModeStatus: true, focusDomain: hostname });
                    }
                    activeFocusUI(true, hostname);
                    alert(`Đã bật chế độ Focus: ${hostname}`);
                } catch (e) { alert("Link không hợp lệ!"); }
            } else {
                if (typeof chrome !== 'undefined' && chrome.storage) {
                    chrome.storage.local.set({ focusModeStatus: false });
                }
                activeFocusUI(false);
            }
        });
    }

    function activeFocusUI(isActive, domain = "") {
        if (!toggleFocusBtn || !focusInput) return;
        if (isActive) {
            toggleFocusBtn.textContent = "DỪNG LẠI";
            toggleFocusBtn.classList.add('focusing');
            focusInput.value = domain;
            focusInput.disabled = true;
        } else {
            toggleFocusBtn.textContent = "BẬT FOCUS";
            toggleFocusBtn.classList.remove('focusing');
            focusInput.disabled = false;
        }
    }

    // ==========================================
    // 9. KÉO THẢ (DRAG & DROP)
    // ==========================================
    const savedPos = JSON.parse(localStorage.getItem('menuPosition'));
    if (savedPos && mainContainer) {
        mainContainer.style.top = savedPos.top;
        mainContainer.style.left = savedPos.left;
        mainContainer.style.transform = "none";
    }

    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    if (dragHandle && mainContainer) {
        dragHandle.addEventListener('mousedown', (e) => {
            isDragging = true;
            dragHandle.style.cursor = 'grabbing';
            startX = e.clientX;
            startY = e.clientY;
            const rect = mainContainer.getBoundingClientRect();
            initialLeft = rect.left;
            initialTop = rect.top;
            mainContainer.style.transform = "none";
            mainContainer.style.left = initialLeft + "px";
            mainContainer.style.top = initialTop + "px";
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            mainContainer.style.left = `${initialLeft + dx}px`;
            mainContainer.style.top = `${initialTop + dy}px`;
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                dragHandle.style.cursor = 'grab';
                const pos = { left: mainContainer.style.left, top: mainContainer.style.top };
                localStorage.setItem('menuPosition', JSON.stringify(pos));
            }
        });
    }
});