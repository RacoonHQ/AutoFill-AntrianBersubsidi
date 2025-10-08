// === TRIAL SYSTEM ===
const TRIAL_DURATION_DAYS = 3;
const STORAGE_KEYS = {
  TRIAL_START: 'trialStartDate',
  TRIAL_EXPIRED: 'trialExpired'
};

// Initialize trial system on extension startup
chrome.runtime.onStartup.addListener(initializeTrialSystem);
chrome.runtime.onInstalled.addListener(initializeTrialSystem);

function initializeTrialSystem() {
  chrome.storage.local.get([STORAGE_KEYS.TRIAL_START], (result) => {
    if (!result[STORAGE_KEYS.TRIAL_START]) {
      // First time installation - start trial
      const trialStartDate = Date.now();
      chrome.storage.local.set({ 
        [STORAGE_KEYS.TRIAL_START]: trialStartDate,
        [STORAGE_KEYS.TRIAL_EXPIRED]: false
      });
      console.log('Trial started:', new Date(trialStartDate));
    } else {
      // Check if trial has expired
      checkTrialStatus();
    }
  });
}

function checkTrialStatus() {
  chrome.storage.local.get([STORAGE_KEYS.TRIAL_START], (result) => {
    const trialStartDate = result[STORAGE_KEYS.TRIAL_START];
    if (trialStartDate) {
      const currentTime = Date.now();
      const trialEndTime = trialStartDate + (TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000);
      const isExpired = currentTime > trialEndTime;
      
      chrome.storage.local.set({ [STORAGE_KEYS.TRIAL_EXPIRED]: isExpired });
      console.log('Trial status checked:', isExpired ? 'EXPIRED' : 'ACTIVE');
    }
  });
}

// Check trial status every hour
setInterval(checkTrialStatus, 60 * 60 * 1000);

chrome.action.onClicked.addListener((tab) => {
    // Buka halaman antrian KJP
    chrome.tabs.create({ url: 'https://antrianpanganbersubsidi.pasarjaya.co.id/' }, (newTab) => {
      // Setelah tab baru dibuka, tunggu hingga halaman dimuat
      chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo, tab) {
        if (tabId === newTab.id && changeInfo.status === 'complete') {
          // Ketika halaman selesai dimuat, jalankan content.js
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
          });
          // Hapus listener setelah dijalankan
          chrome.tabs.onUpdated.removeListener(listener);
        }
      });
    });
  });
  
// === Automasi Harian Berdasarkan Toggle ===
let autoInterval = null;

function scheduleAutoOpen() {
  if (autoInterval) clearInterval(autoInterval);
  autoInterval = setInterval(() => {
    chrome.storage.local.get(['autoMode'], (result) => {
      if (!result.autoMode) return; // Tidak aktif, skip
      const now = new Date();
      if (now.getHours() === 7 && now.getMinutes() === 0 && now.getSeconds() < 5) {
        // Buka tab dan jalankan autofill
        chrome.tabs.create({ url: 'https://antrianpanganbersubsidi.pasarjaya.co.id/' }, (newTab) => {
          chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo, tab) {
            if (tabId === newTab.id && changeInfo.status === 'complete') {
              chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['content.js']
              });
              chrome.tabs.onUpdated.removeListener(listener);
            }
          });
        });
      }
    });
  }, 1000); // Cek tiap detik
}

// Pantau perubahan toggle
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.autoMode) {
    if (changes.autoMode.newValue) {
      scheduleAutoOpen();
    } else {
      if (autoInterval) clearInterval(autoInterval);
      autoInterval = null;
    }
  }
});

// Inisialisasi saat background aktif
chrome.storage.local.get(['autoMode'], (result) => {
  if (result.autoMode) scheduleAutoOpen();
});
  
// Handler pesan dari content.js untuk screenshot barcode
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'take_screenshot' && sender.tab) {
    chrome.tabs.captureVisibleTab(sender.tab.windowId, { format: 'png' }, (dataUrl) => {
      if (chrome.runtime.lastError || !dataUrl) return;
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const filename = `antrian-barcode-${yyyy}-${mm}-${dd}.png`;
      chrome.downloads.download({
        url: dataUrl,
        filename: filename,
        saveAs: false
      });
    });
  }
});
  