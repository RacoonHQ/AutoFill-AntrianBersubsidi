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
  autoInterval = setInterval(async () => {
    try {
      const settings = await new Promise((resolve) => {
        chrome.storage.local.get(['autoOpenSettings'], (result) => {
          resolve(result.autoOpenSettings || { enabled: false });
        });
      });

      if (!settings.enabled) {
        return; // Tidak aktif, skip
      }

      // Fetch waktu akurat dari World Time API untuk WIB
      let currentHour, currentMinute;
      try {
        const response = await fetch('https://worldtimeapi.org/api/timezone/Asia/Jakarta');
        if (response.ok) {
          const data = await response.json();
          const dateTime = new Date(data.utc_datetime);
          currentHour = dateTime.getHours();
          currentMinute = dateTime.getMinutes();
          console.log(`🕐 Waktu dari API: ${currentHour}:${currentMinute} WIB`);
        } else {
          throw new Error('API response not ok');
        }
      } catch (apiError) {
        console.warn('❌ Gagal fetch API waktu, fallback ke waktu lokal:', apiError.message);
        // Fallback ke waktu lokal jika API gagal
        const now = new Date();
        currentHour = now.getHours();
        currentMinute = now.getMinutes();
        console.log(`🕐 Fallback waktu lokal: ${currentHour}:${currentMinute} WIB`);
      }

      if (currentHour === 7 && currentMinute === 0) {
        console.log('🚀 Starting full automation: Opening 5 tabs at 07:00 WIB (via API)');

        // Get stored profile to check if auto-fill should run
        const profileData = await new Promise((resolve) => {
          chrome.storage.local.get(['profile'], (result) => {
            resolve(result.profile || { profile: null });
          });
        });

        const isAutoFillEnabled = profileData.profile?.autoSubmit !== false; // Default to true if not set

        console.log('📋 Profile loaded, auto-fill enabled:', isAutoFillEnabled);

        // Open 5 tabs using AUTO_OPEN_URLS from popup.js logic (simplified here)
        const AUTO_OPEN_URLS = [
          'https://antrianpanganbersubsidi.pasarjaya.co.id/?tab=1',
          'https://antrianpanganbersubsidi.pasarjaya.co.id/?tab=2',
          'https://antrianpanganbersubsidi.pasarjaya.co.id/?tab=3',
          'https://antrianpanganbersubsidi.pasarjaya.co.id/?tab=4',
          'https://antrianpanganbersubsidi.pasarjaya.co.id/?tab=5'
        ];

        let openedTabs = [];
        let completedTabs = 0;

        AUTO_OPEN_URLS.forEach((url, index) => {
          setTimeout(() => {
            chrome.tabs.create({ url: url }, (tab) => {
              if (chrome.runtime.lastError) {
                console.error('❌ Error opening tab:', chrome.runtime.lastError);
              } else {
                console.log(`✅ Tab ${index + 1} opened: ${url}`);
                openedTabs.push(tab);

                chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo, tabInfo) {
                  if (tabId === tab.id && changeInfo.status === 'complete') {
                    chrome.tabs.onUpdated.removeListener(listener);

                    if (isAutoFillEnabled) {
                      setTimeout(() => {
                        chrome.tabs.sendMessage(tabId, { action: 'runAutofill' }, (response) => {
                          completedTabs++;
                          if (response && response.success) {
                            console.log(`✅ Auto-fill SUCCESS on tab ${completedTabs}/${openedTabs.length}`);
                          } else {
                            const errorMsg = response ? response.error : 'No response';
                            console.error(`❌ Auto-fill FAILED on tab ${completedTabs}:`, errorMsg);
                          }

                          if (completedTabs >= openedTabs.length) {
                            console.log('🎉 FULL AUTOMATION COMPLETED');
                          }
                        });
                      }, 3000);
                    } else {
                      completedTabs++;
                      if (completedTabs >= openedTabs.length) {
                        console.log('✅ All tabs opened (auto-fill disabled)');
                      }
                    }
                  }
                });
              }
            });
          }, index * 1000);
        });
      }
    } catch (error) {
      console.error('❌ Error in daily automation:', error);
    }
  }, 10 * 1000); // Check every 10 seconds for better accuracy

  console.log('⏰ Daily automation scheduled for 07:00 WIB (5 tabs + auto-fill) using API time');
}

function clearAutoOpen() {
  if (autoInterval) {
    clearInterval(autoInterval);
    autoInterval = null;
    console.log('Daily automation cleared');
  }
}

// Pantau perubahan toggle
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.autoOpenSettings) {
    const newSettings = changes.autoOpenSettings.newValue;
    if (newSettings && newSettings.enabled) {
      scheduleAutoOpen();
    } else {
      clearAutoOpen();
    }
  }
});

// Inisialisasi saat background aktif
chrome.storage.local.get(['autoOpenSettings'], (result) => {
  const settings = result.autoOpenSettings || { enabled: false };
  if (settings.enabled) {
    scheduleAutoOpen();
  }
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