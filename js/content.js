var STORAGE_KEYS = {
  AUTH: 'authData',
  PROFILE: 'profileData'
};

async function initAutofill() {
  try {
    console.log('Starting autofill process...');

    // Check authentication first
    console.log('Checking authentication...');
    const isAuth = await checkAuthentication();
    console.log('Authentication status:', isAuth);

    if (!isAuth) {
      console.log('User not authenticated, skipping autofill');
      throw new Error('User tidak ter-authentikasi. Silakan login terlebih dahulu.');
    }

    console.log('Getting stored profile...');
    const [{ profile: storedProfile }] = await Promise.all([
      getStoredProfile()
    ]);

    const profile = storedProfile;
    console.log('Profile data:', profile);

    if (!profile) {
      console.log('No profile found');
      throw new Error('Data profil tidak ditemukan. Silakan isi data di Form Data terlebih dahulu.');
    }

    if (!profile.kk || !profile.ktp || !profile.atm || !profile.tanggalLahir) {
      console.log('Profile incomplete:', profile);
      throw new Error('Data profil belum lengkap. Pastikan semua field sudah diisi.');
    }

    console.log('Applying profile to form...');
    await applyProfile(profile);
    console.log('Profile applied successfully');

  } catch (error) {
    console.error('Gagal memuat data profil:', error);
    throw error;
  }
}

async function checkAuthentication() {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEYS.AUTH], (result) => {
      const authData = result[STORAGE_KEYS.AUTH];

      if (authData && authData.expiresAt > Date.now()) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}

function getStoredProfile() {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEYS.PROFILE], (result) => {
      resolve(result[STORAGE_KEYS.PROFILE] || {});
    });
  });
}

async function applyProfile(profile) {
  console.log('Starting to apply profile:', profile);

  const wilayahSelect = document.getElementById('wilayah');
  console.log('Wilayah select element:', wilayahSelect);

  if (!wilayahSelect) {
    throw new Error('Elemen form "wilayah" tidak ditemukan di halaman');
  }

  if (selectOptionByValueOrIndex(wilayahSelect, profile.wilayah)) {
    console.log('Wilayah selected:', profile.wilayah);
    wilayahSelect.dispatchEvent(new Event('change', { bubbles: true }));
  }

  const lokasiSelected = await waitForLokasiSelection(profile.lokasi);
  if (lokasiSelected) {
    const lokasiSelect = document.getElementById('lokasi');
    console.log('Lokasi selected:', profile.lokasi);
    lokasiSelect.dispatchEvent(new Event('change', { bubbles: true }));
  }

  await delay(200);
  console.log('Setting input values...');
  setInputValue('kk', profile.kk);
  setInputValue('ktp', profile.ktp);
  setInputValue('kartu', profile.atm);
  setInputValue('thn', profile.tanggalLahir);

  console.log('Checking agreement box...');
  checkAgreementBox();

  if (profile.autoSubmit) {
    console.log('Auto-submit enabled, triggering submit...');
    triggerSubmit();
  }

  console.log('Profile application completed');
}

function waitForLokasiSelection(targetLokasi, timeout = 6000, interval = 200) {
  const targetValue = targetLokasi ? targetLokasi.toString().trim() : null;

  return new Promise((resolve) => {
    const start = Date.now();

    const trySelect = () => {
      const lokasiSelect = document.getElementById('lokasi');
      if (!lokasiSelect) {
        if (Date.now() - start >= timeout) return resolve(false);
        return setTimeout(trySelect, interval);
      }

      if (targetValue) {
        if (selectOptionByValueOrIndex(lokasiSelect, targetValue)) {
          return resolve(true);
        }
      }

      if (lokasiSelect.options.length > 0) {
        lokasiSelect.selectedIndex = lokasiSelect.selectedIndex >= 0 ? lokasiSelect.selectedIndex : 0;
        return resolve(true);
      }

      if (Date.now() - start >= timeout) return resolve(false);
      setTimeout(trySelect, interval);
    };

    trySelect();
  });
}

function selectOptionByValueOrIndex(selectElement, targetValue) {
  if (!selectElement) return false;
  const normalizedTarget = targetValue ? targetValue.toString().trim() : '';

  if (normalizedTarget) {
    const exactMatch = Array.from(selectElement.options).find((option) => option.value === normalizedTarget);
    if (exactMatch) {
      selectElement.value = exactMatch.value;
      return true;
    }

    const index = parseInt(normalizedTarget, 10);
    if (!Number.isNaN(index) && index > 0 && index <= selectElement.options.length) {
      selectElement.selectedIndex = index - 1;
      return true;
    }
  }

  if (selectElement.options.length > 0) {
    selectElement.selectedIndex = 0;
    return true;
  }

  return false;
}

function setInputValue(elementId, value) {
  const element = document.getElementById(elementId);
  if (element && typeof value !== 'undefined') {
    if (element.value !== value) {
      element.value = value;
    }
    element.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function checkAgreementBox() {
  const box = document.getElementById('box');
  if (box && !box.checked) {
    box.checked = true;
    box.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

function triggerSubmit() {
  const saveButton = document.getElementById('daterange-btn');
  if (saveButton) {
    saveButton.click();
  }
}

// Listen for messages from popup script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Content script received message:', message);

  if (message.action === 'runAutofill') {
    console.log('Received runAutofill message from popup');

    // Run autofill asynchronously
    initAutofill()
      .then(() => {
        console.log('Autofill completed successfully');
        sendResponse({ success: true, message: 'Autofill completed' });
      })
      .catch((error) => {
        console.error('Autofill failed:', error);
        sendResponse({ success: false, error: error.message });
      });

    // Return true to indicate we'll respond asynchronously
    return true;
  }
});

// Fungsi untuk menangani pengisian captcha secara manual dan klik tombol simpan
function autoFillAndSubmit() {
  // Tunggu sampai pengguna selesai mengisi CAPTCHA
  const captchaInput = document.querySelector('input[name="captha"]');
  if (captchaInput && captchaInput.value !== '') {
    // Centang checkbox
    const box = document.getElementById('box');
    if (box) box.checked = true;

    // Klik tombol simpan dengan ID 'daterange-btn'
    const saveButton = document.getElementById('daterange-btn');
    if (saveButton) saveButton.click();
  } else {
    console.log('Captcha belum diisi');
  }
}

// Memanggil fungsi setelah perubahan captcha
const captchaField = document.querySelector('input[name="captha"]');
if (captchaField) {
  captchaField.addEventListener('input', () => {
    setTimeout(() => {
      autoFillAndSubmit();
    }, 500); // Delay sedikit untuk memastikan input selesai
  });
}

// === Deteksi qrcode dan trigger screenshot ===
function waitForQrcodeAndScreenshot() {
  const checkQrcode = () => {
    // Deteksi qrcode: img/canvas/elemen dengan kata 'qrcode'
    const imgQrcode = Array.from(document.images).find(img => (img.alt+img.src+img.className+img.id).toLowerCase().includes('qrcode'));
    const canvasQrcode = Array.from(document.querySelectorAll('canvas')).find(c => (c.className+c.id).toLowerCase().includes('qrcode'));
    const textQrcode = Array.from(document.querySelectorAll('[class*="qrcode" i], [id*="qrcode" i]')).find(e => e.offsetParent !== null);
    if (imgQrcode || canvasQrcode || textQrcode) {
      // Qrcode terdeteksi, kirim pesan ke background
      chrome.runtime.sendMessage({ action: 'take_screenshot' });
      return true;
    }
    return false;
  };
  // Cek setiap 1 detik, maksimal 30 detik
  let tries = 0;
  const interval = setInterval(() => {
    if (checkQrcode() || ++tries > 30) clearInterval(interval);
  }, 1000);
}

// Setelah submit, tunggu qrcode
const saveButton = document.getElementById('daterange-btn');
if (saveButton) {
  saveButton.addEventListener('click', () => {
    setTimeout(waitForQrcodeAndScreenshot, 2000); // Mulai cek qrcode 2 detik setelah submit
  });
}




