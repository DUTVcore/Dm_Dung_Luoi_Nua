// Lang nghe khi nguoi dung chuyen Tab
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    checkTab(activeInfo.tabId);
});

// Lang nghe khi Tab tai xong hoac doi URL
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        checkTab(tabId);
    }
});

async function checkTab(tabId) {
    // Lay du lieu tu bo nho
    const result = await chrome.storage.local.get(['focusModeStatus', 'focusDomain']);
    const isFocusing = result.focusModeStatus === true;
    const allowedDomain = result.focusDomain || "";

    if (!isFocusing || !allowedDomain) return;

    // Lay thong tin tab hien tai
    try {
        const tab = await chrome.tabs.get(tabId);
        // Bo qua cac trang he thong chrome:// hoac trang newtab cua minh
        if (!tab.url || tab.url.startsWith('chrome://') || tab.url.includes('newtab.html')) return;

        // Phan tich domain cua tab hien tai
        const currentDomain = new URL(tab.url).hostname;

        // So sanh (cho phep subdomain va path con)
        // Logic: currentDomain phai CHUA allowedDomain hoac nguoc lai de bao quat
        // Vi du: allowed "google.com" thi "gemini.google.com" van ok.
        if (!currentDomain.includes(allowedDomain) && !allowedDomain.includes(currentDomain)) {
            
            // VI PHAM! Ban canh bao vao mat
            chrome.scripting.executeScript({
                target: { tabId: tabId },
                func: (domain) => {
                    alert(`⚠️ CANH BAO TAP TRUNG!\n\nBan dang focus vao: ${domain}\n\nQuay lai lam viec di! NO DISTRACTION !!!`);
                    // Tuy chon: Tu dong quay ve trang newtab (bo comment dong duoi neu muon gat hon)
                    // window.location.href = "chrome://newtab"; 
                },
                args: [allowedDomain]
            });
        }
    } catch (e) {
        console.log("Loi check tab:", e);
    }
}
