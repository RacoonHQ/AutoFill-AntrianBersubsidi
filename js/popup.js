// Repository URLs - pisahkan untuk fleksibilitas update
const USER_DATA_REPO = 'https://raw.githubusercontent.com/RacoonHQ/KJP/main/';
const PROFILES_DATA_REPO = 'https://raw.githubusercontent.com/RacoonHQ/KJP/main/';

const USER_DATA_URL = 'data/user.json';
const PROFILES_DATA_URL = 'data/profiles.json';

// URLs untuk auto-open tabs (bisa dikustomisasi)
// Edit array ini untuk mengubah URL yang akan dibuka otomatis setiap jam 07:00
// Pastikan semua URL valid dan dapat diakses
const AUTO_OPEN_URLS = [
  'https://antrianpanganbersubsidi.pasarjaya.co.id/?tab=1',
  'https://antrianpanganbersubsidi.pasarjaya.co.id/?tab=2',
  'https://antrianpanganbersubsidi.pasarjaya.co.id/?tab=3',
  'https://antrianpanganbersubsidi.pasarjaya.co.id/?tab=4',
  'https://antrianpanganbersubsidi.pasarjaya.co.id/?tab=5'
];

const STORAGE_KEYS = {
  AUTH: 'authData',
  PROFILE: 'profileData',
  LAST_UPDATE: 'lastDataUpdate',
  AUTO_OPEN_SETTINGS: 'autoOpenSettings'
};
// DOM Elements for admin section
let adminSection, userList, addUserBtn, syncDataBtn, newUserId, newPassword, newExpiry;
let userFormSection, loginButton, logoutButton;
let userIdInput, passwordInput, loginStatus, userNameDisplay;
let loginSection;

// Navbar element
let navbar;
// Initialize DOM elements
let openWebBtn, runScriptBtn;

function initializeElements() {
  // Authentication elements
  loginSection = document.getElementById('loginSection');
  userInfo = document.getElementById('userInfo');
  userFormSection = document.getElementById('userFormSection');
  adminSection = document.getElementById('adminSection');
  loginButton = document.getElementById('loginButton');
  logoutButton = document.getElementById('logoutButton');
  userIdInput = document.getElementById('userId');
  passwordInput = document.getElementById('password');
  loginStatus = document.getElementById('loginStatus');
  userNameDisplay = document.getElementById('userName');

  // Header elements
  headerUserId = document.getElementById('headerUserId');
  settingsBtn = document.getElementById('settingsBtn');
  userExpiry = document.getElementById('userExpiry');

  // Navbar element
  navbar = document.querySelector('.navbar');

  // Quick Actions elements
  openWebBtn = document.getElementById('openWeb');
  runScriptBtn = document.getElementById('runScript');

  // Form elements
  kkInput = document.getElementById('kkInput');
  ktpInput = document.getElementById('ktpInput');
  kartuInput = document.getElementById('kartuInput');
  tanggalLahirInput = document.getElementById('tanggalLahirInput');
  autoSubmitToggle = document.getElementById('autoSubmitToggle');
  wilayahSelect = document.getElementById('wilayahSelect');
  lokasiSelect = document.getElementById('lokasiSelect');
  saveButton = document.getElementById('saveProfile');
  resetLocationButton = document.getElementById('resetLocation');

  // Settings elements
  autoFillToggle = document.getElementById('autoFillToggle');
  autoOpenWebsiteToggle = document.getElementById('autoOpenWebsiteToggle');
  testAutoOpen = document.getElementById('testFeatures');
  settingsLogoutButton = document.getElementById('settingsLogoutButton');
  settingsUserId = document.getElementById('settingsUserId');
  settingsUserStatus = document.getElementById('settingsUserStatus');
  settingsUserExpiry = document.getElementById('settingsUserExpiry');
  backToMain = document.getElementById('backToMain');
  settingsLogoutBtn = document.getElementById('settingsLogoutBtn');

  console.log('DOM elements initialized:', {
    autoFillToggle: !!autoFillToggle,
    autoOpenWebsiteToggle: !!autoOpenWebsiteToggle,
    testAutoOpen: !!testAutoOpen
  });
}

function handleOpenWebsite() {
  console.log('Opening website tab...');

  // Show loading state
  const originalText = openWebBtn.textContent;
  openWebBtn.textContent = 'Membuka...';
  openWebBtn.disabled = true;

  // Open only the first tab from the list
  const url = AUTO_OPEN_URLS[0]; // Take the first URL
  chrome.tabs.create({ url: url }, (tab) => {
    if (chrome.runtime.lastError) {
      console.error('Error opening tab:', chrome.runtime.lastError);
    } else {
      console.log(`✅ Tab berhasil dibuka: ${url}`);
    }
  });

  // Restore button after delay
  setTimeout(() => {
    openWebBtn.textContent = originalText;
    openWebBtn.disabled = false;
    console.log('Tab opened successfully');
  }, 2000);
}

function handleRunScript() {
  console.log('Running auto-fill script...');

  // Check if user is authenticated and has profile data
  if (!isAuthenticated) {
    alert('❌ Error: Anda harus login terlebih dahulu!');
    return;
  }

  // Show loading state
  const originalText = runScriptBtn.textContent;
  runScriptBtn.textContent = 'Menjalankan...';
  runScriptBtn.disabled = true;

  // Get current active tab and run autofill
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) {
      alert('❌ Error: Tidak ada tab aktif!');
      runScriptBtn.textContent = originalText;
      runScriptBtn.disabled = false;
      return;
    }

    const currentTab = tabs[0];
    if (!currentTab.url.includes('antrianpanganbersubsidi.pasarjaya.co.id')) {
      alert('❌ Error: Buka dulu website antrian terlebih dahulu!');
      runScriptBtn.textContent = originalText;
      runScriptBtn.disabled = false;
      return;
    }

    // Send message to content script to run autofill
    chrome.tabs.sendMessage(currentTab.id, { action: 'runAutofill' }, (response) => {
      runScriptBtn.textContent = originalText;
      runScriptBtn.disabled = false;

      if (response && response.success) {
        console.log('✅ Auto-fill berhasil dijalankan');
        alert('✅ Auto-fill berhasil dijalankan!');
      } else {
        const errorMsg = response ? response.error : 'Tidak ada respons dari halaman';
        console.error('❌ Auto-fill gagal:', errorMsg);
        alert('❌ Auto-fill gagal: ' + errorMsg);
      }
    });
  });
}

// State variables
let wilayahData = [];
let userData = [];
let currentUser = null;
let isAuthenticated = false;

init();

async function init() {
  try {
    console.log('=== INITIALIZATION STARTED ===');

    // Initialize DOM elements first
    console.log('Initializing DOM elements...');
    initializeElements();
    console.log('✅ DOM elements initialized');

    // Load data from GitHub first
    console.log('Loading online data...');
    await loadOnlineData();
    console.log('✅ Online data loaded successfully');

    // Check authentication status
    console.log('Checking authentication status...');
    await checkAuthentication();
    console.log('✅ Authentication checked:', isAuthenticated ? 'authenticated' : 'not authenticated');

    // Initialize UI based on auth status
    console.log('Updating UI...');
    updateUI();
    console.log('✅ UI updated');

    if (isAuthenticated) {
      // User biasa: inisialisasi form
      await initializeForm();
    }

// Always attach event listeners (login is always available)
    console.log('Attaching event listeners...');
    attachEventListeners();
    console.log('✅ Event listeners attached');

    // Initialize settings AFTER DOM and event listeners are ready
    if (isAuthenticated) {
      console.log('Initializing settings for authenticated user...');
      setTimeout(() => {
        initializeSettings();
      }, 100); // Small delay to ensure DOM is fully ready
    }

    console.log('=== INITIALIZATION COMPLETED ===');
  } catch (error) {
    console.error('❌ Initialization error:', error);
    // Pastikan UI tetap bisa menampilkan error meskipun beberapa elements tidak ditemukan
    try {
      if (loginStatus) {
        setLoginStatus('Gagal memuat data sistem.', true);
      }
    } catch (e) {
      console.error('Cannot set login status - element not found');
    }
  }
}

// Re-initialize elements and attach listeners (called after login)
function reInitializeElementsAndListeners() {
  console.log('Re-initializing elements and listeners...');
  
  // Re-initialize DOM elements (in case settings page elements weren't available before)
  initializeElements();
  
  // Attach all event listeners
  attachEventListeners();
  
  // Initialize settings if user is authenticated
  if (isAuthenticated) {
    initializeSettings();
  }
  
  console.log('✅ Elements and listeners re-initialized');
}

async function loadOnlineData() {
  try {
    console.log('Loading data from GitHub...');
    let userDataLoaded = false;
    let profilesDataLoaded = false;

    // Load user data from dedicated user repository
    try {
      const userResponse = await fetch(`${USER_DATA_REPO}${USER_DATA_URL}`);
      if (userResponse.ok) {
        userData = await userResponse.json();
        console.log('User data loaded successfully:', userData.users?.length || 0, 'users');
        userDataLoaded = true;
      } else {
        console.log('Failed to load user data from GitHub, falling back to local');
      }
    } catch (error) {
      console.log('Error fetching user data from GitHub:', error.message);
    }

    // Fallback to local data if user repo fails
    if (!userDataLoaded) {
      try {
        const localResponse = await fetch(chrome.runtime.getURL(USER_DATA_URL));
        if (localResponse.ok) {
          userData = await localResponse.json();
          console.log('User data loaded from local');
          userDataLoaded = true;
        }
      } catch (error) {
        console.error('Error loading local user data:', error);
      }
    }

    // Load profiles data from dedicated profiles repository
    try {
      const profilesResponse = await fetch(`${PROFILES_DATA_REPO}${PROFILES_DATA_URL}`);
      if (profilesResponse.ok) {
        const profilesData = await profilesResponse.json();
        wilayahData = profilesData.wilayah || [];
        console.log('Profiles data loaded successfully:', wilayahData.length, 'wilayah');
        profilesDataLoaded = true;
      } else {
        console.log('Failed to load profiles data from GitHub, falling back to local');
      }
    } catch (error) {
      console.log('Error fetching profiles data from GitHub:', error.message);
    }

    // Fallback to local profiles data
    if (!profilesDataLoaded) {
      try {
        const localResponse = await fetch(chrome.runtime.getURL(PROFILES_DATA_URL));
        if (localResponse.ok) {
          const profilesData = await localResponse.json();
          wilayahData = profilesData.wilayah || [];
          console.log('Profiles data loaded from local');
          profilesDataLoaded = true;
        }
      } catch (error) {
        console.error('Error loading local profiles data:', error);
      }
    }

    // Pastikan ada data default jika semua gagal
    if (!userDataLoaded || !userData.users || userData.users.length === 0) {
      console.warn('No user data loaded, using empty array');
      userData = { users: [] };
    }

    if (!profilesDataLoaded || wilayahData.length === 0) {
      console.warn('No profiles data loaded, using empty array');
      wilayahData = [];
    }

    // Store last update timestamp
    chrome.storage.local.set({ [STORAGE_KEYS.LAST_UPDATE]: Date.now() });

  } catch (error) {
    console.error('Error loading online data:', error);
    throw error;
  }
}

async function checkAuthentication() {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEYS.AUTH], (result) => {
      const authData = result[STORAGE_KEYS.AUTH];

      if (authData && authData.expiresAt > Date.now()) {
        currentUser = authData.user;
        isAuthenticated = true;
      } else {
        currentUser = null;
        isAuthenticated = false;
      }

      resolve();
    });
  });
}

function updateUI() {
  console.log('updateUI called - isAuthenticated:', isAuthenticated, 'currentUser:', currentUser);

  // Get navbar, header, and content area elements
  const navbar = document.querySelector('.navbar');
  const headerBar = document.querySelector('.header-bar');
  const contentArea = document.querySelector('.content-area');
  const actionsPage = document.getElementById('actionsPage');
  const formPage = document.getElementById('formPage');
  const settingsPage = document.getElementById('settingsPage');

  // Update header with user ID
  if (headerUserId) {
    if (isAuthenticated && currentUser) {
      headerUserId.textContent = currentUser.id;
    } else {
      headerUserId.textContent = 'Guest';
    }
  }

  if (isAuthenticated && currentUser) {
    console.log('User authenticated, updating UI for user:', currentUser.id);

    // Show header and navbar
    if (headerBar) headerBar.style.display = 'flex';
    const navbarElement = document.querySelector('.navbar');
    if (navbarElement) navbarElement.style.display = 'flex';

    // Remove login-only class from content area
    if (contentArea) contentArea.classList.remove('login-only');

    // Show pages (let navigation.js handle the actual display logic)
    // We'll just ensure the correct initial state based on auth
    if (actionsPage) actionsPage.style.display = 'block';
    if (formPage) formPage.style.display = 'none';
    if (settingsPage) settingsPage.style.display = 'none';

    // Hide login form
    if (loginSection) loginSection.classList.add('hidden');

    // Show user info for authenticated users
    if (userInfo) userInfo.classList.remove('hidden');

    // Show form section for regular users
    if (userFormSection) userFormSection.classList.remove('hidden');

    if (userNameDisplay) {
      console.log('Setting username to:', currentUser.id);
      userNameDisplay.textContent = currentUser.id;
    } else {
      console.error('userNameDisplay element not found!');
    }

    // Update user info in settings page
    updateSettingsUserInfo();

    // Initialize settings if user is authenticated
    if (isAuthenticated) {
      initializeSettings();
    }

  } else {
    console.log('User not authenticated, showing login form only');

    // Hide header and navbar when not authenticated
    if (headerBar) headerBar.style.display = 'none';
    const navbarElement = document.querySelector('.navbar');
    if (navbarElement) navbarElement.style.display = 'none';

   
    if (contentArea) contentArea.classList.add('login-only');

    // Hide all pages when not authenticated
    if (actionsPage) actionsPage.style.display = 'none';
    if (formPage) formPage.style.display = 'none';
    if (settingsPage) settingsPage.style.display = 'none';
  }
}

function updateUserExpiryDisplay() {
  if (!userExpiry || !currentUser) return;

  const now = new Date();
  const expiryDate = new Date(currentUser.expires_at);
  const isExpired = expiryDate < now;
  const timeDiff = expiryDate.getTime() - now.getTime();
  const daysRemaining = Math.ceil(timeDiff / (24 * 60 * 60 * 1000));

  let expiryText = '';
  let expiryClass = '';

  if (isExpired) {
    expiryText = 'Akun Kadaluarsa';
    expiryClass = 'expired';
  } else if (daysRemaining <= 7) {
    expiryText = `Kadaluarsa dalam ${daysRemaining} hari`;
    expiryClass = 'warning';
  } else {
    expiryText = `Aktif hingga ${expiryDate.toLocaleDateString('id-ID')}`;
    expiryClass = '';
  }

  userExpiry.textContent = expiryText;
  userExpiry.className = `user-expiry ${expiryClass}`;
}

function attachEventListeners() {
  console.log('attachEventListeners called');

  // Authentication events - selalu aktif
  if (loginButton) {
    loginButton.addEventListener('click', handleLogin);
    console.log('Login button listener attached');
  }
  if (logoutButton) {
    logoutButton.addEventListener('click', handleLogout);
    console.log('Logout button listener attached');
  }

  // Settings button event (gear icon in header)
  if (settingsBtn && isAuthenticated) {
    settingsBtn.addEventListener('click', () => {
      console.log('Settings button clicked - showing settings page');

      // Hide navbar
      const navbarElement = document.querySelector('.navbar');
      if (navbarElement) navbarElement.style.display = 'none';

      // Hide all pages
      if (actionsPage) actionsPage.style.display = 'none';
      if (formPage) formPage.style.display = 'none';

      // Show only settings page
      if (settingsPage) settingsPage.style.display = 'block';

      // Update settings user info
      updateSettingsUserInfo();
    });
    console.log('Settings button listener attached');
  }

  // Back button event
  if (backToMain && isAuthenticated) {
    backToMain.addEventListener('click', () => {
      console.log('Back button clicked - returning to main');

      // Show navbar
      const navbarElement = document.querySelector('.navbar');
      if (navbarElement) navbarElement.style.display = 'flex';

      // Hide settings page
      if (settingsPage) settingsPage.style.display = 'none';

      // Show actions page (default)
      if (actionsPage) actionsPage.style.display = 'block';

      // Update navbar active state
      const actionsNavBtn = document.querySelector('.nav-btn[data-page="actions"]');
      const formNavBtn = document.querySelector('.nav-btn[data-page="form"]');

      if (actionsNavBtn) actionsNavBtn.classList.add('active');
      if (formNavBtn) formNavBtn.classList.remove('active');
    });
    console.log('Back button listener attached');
  }

  // Quick action buttons - selalu aktif jika user authenticated
  if (openWebBtn && isAuthenticated) {
    openWebBtn.addEventListener('click', handleOpenWebsite);
    console.log('Open website button listener attached');
  }
  if (runScriptBtn && isAuthenticated) {
    runScriptBtn.addEventListener('click', handleRunScript);
    console.log('Run script button listener attached');
  }

  // USER BIASA: Form dan aksi cepat events
  if (isAuthenticated) {
    console.log('Attaching authenticated user event listeners');

    // Form events
    if (wilayahSelect) {
      wilayahSelect.addEventListener('change', handleWilayahChange);
      console.log('Wilayah select listener attached');
    }
    if (saveButton) {
      saveButton.addEventListener('click', handleSaveProfile);
      console.log('Save profile button listener attached');
    }
    if (resetLocationButton) {
      resetLocationButton.addEventListener('click', () => handleReset(true));
      console.log('Reset location button listener attached');
    }

    // Settings events - selalu aktif jika user authenticated
    if (isAuthenticated) {
      console.log('Attaching settings event listeners');

      // Auto-open settings
      if (autoOpenWebsiteToggle) {
        autoOpenWebsiteToggle.addEventListener('change', handleAutoOpenToggle);
        console.log('Auto-open toggle listener attached');
      }
      if (testAutoOpen) {
        testAutoOpen.addEventListener('click', handleTestAutoOpen);
        console.log('Test auto-open listener attached');
      }

      // Settings logout
      if (settingsLogoutButton) {
        settingsLogoutButton.addEventListener('click', handleLogout);
        console.log('Settings logout button listener attached');
      }

      // New settings logout button
      if (settingsLogoutBtn) {
        settingsLogoutBtn.addEventListener('click', handleLogout);
        console.log('New settings logout button listener attached');
      }
    }
  } else {
    console.log('User not authenticated, skipping form event listeners');
  }
}

async function handleLogin() {
  const userId = userIdInput?.value?.trim();
  const password = passwordInput?.value;

  console.log('handleLogin called');
  console.log('userId:', userId);
  console.log('password:', password ? '[HIDDEN]' : 'empty');
  console.log('loginButton exists:', !!loginButton);

  if (!userId || !password) {
    console.log('Validation failed: empty fields');
    setLoginStatus('User ID dan Password harus diisi.', true);
    return;
  }

  if (!userData || !userData.users) {
    console.error('User data not loaded');
    setLoginStatus('Data pengguna tidak tersedia.', true);
    return;
  }

  console.log('Attempting login for user:', userId);
  console.log('Available users:', userData.users?.length || 0);

  // Find user in loaded data
  const user = userData.users?.find(u => u.id === userId && u.password === password);

  console.log('Found user:', user);

  if (user && user.status === 'active') {
    console.log('Login successful for user:', user.id);
    const now = Date.now();
    const expiresAt = now + (24 * 60 * 60 * 1000); // 24 hours

    const authData = {
      user: user,
      loginTime: now,
      expiresAt: expiresAt
    };

    console.log('Saving auth data...');

    chrome.storage.local.set({ [STORAGE_KEYS.AUTH]: authData }, () => {
      currentUser = user;
      isAuthenticated = true;
      console.log('Auth data saved, updating UI');
      updateUI();
      setLoginStatus('Login berhasil!');

      // Re-attach form event listeners after login
      setTimeout(() => {
        attachEventListeners();
        initializeForm();
        initializeSettings(); // Pastikan settings juga diinisialisasi
      }, 100);
    });
  } else {
    console.log('Login failed - user not found or inactive');
    setLoginStatus('User ID atau Password salah, atau akun tidak aktif.', true);
  }
}

function handleLogout() {
  // Hapus semua data authentication dari storage
  chrome.storage.local.remove([STORAGE_KEYS.AUTH, STORAGE_KEYS.PROFILE], () => {
    console.log('Auth data cleared from storage');

    // Reset semua state variables
    currentUser = null;
    isAuthenticated = false;

    // Clear form fields dengan aman
    if (userIdInput) userIdInput.value = '';
    if (passwordInput) passwordInput.value = '';

    // Clear expiration display
    if (userExpiry) {
      userExpiry.textContent = '';
      userExpiry.className = 'user-expiry';
    }

    // Update UI untuk kembali ke login screen
    updateUI();
    setLoginStatus('');

    // Re-attach event listeners untuk memastikan tombol login aktif
    setTimeout(() => {
      attachEventListeners();
      console.log('Event listeners re-attached after logout');
    }, 100);
  });
}

function handleSettings() {
  console.log('Settings button clicked');

  // Remove existing settings menu first
  const existingMenu = document.querySelector('.settings-menu');
  if (existingMenu) {
    existingMenu.remove();
    return; // Toggle off if menu already exists
  }

  if (isAuthenticated && currentUser) {
    // Create settings menu
    const menuDiv = document.createElement('div');
    menuDiv.className = 'settings-menu';
    menuDiv.style.cssText = `
      position: absolute;
      top: 45px;
      right: 16px;
      background: white;
      border: 1px solid #e5e5e5;
      border-radius: 8px;
      padding: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      min-width: 200px;
    `;

    // Auto-open website checkbox
    const autoOpenDiv = document.createElement('div');
    autoOpenDiv.style.cssText = `
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;
      margin-bottom: 8px;
    `;

    const autoOpenLabel = document.createElement('label');
    autoOpenLabel.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #333;
      cursor: pointer;
      user-select: none;
    `;

    const autoOpenCheckbox = document.createElement('input');
    autoOpenCheckbox.type = 'checkbox';
    autoOpenCheckbox.id = 'autoOpenWebsite';
    autoOpenCheckbox.style.cssText = `
      margin: 0;
      cursor: pointer;
    `;

    // Load saved setting
    getStoredAutoOpenSettings().then((settings) => {
      autoOpenCheckbox.checked = !!settings.enabled;
    });

    autoOpenCheckbox.addEventListener('change', (e) => {
      const settings = {
        enabled: e.target.checked,
        hour: '7',
        minute: '0',
        timezone: 'Asia/Jakarta'
      };

      chrome.storage.local.set({ [STORAGE_KEYS.AUTO_OPEN_SETTINGS]: settings }, () => {
        console.log('Auto-open website setting saved:', e.target.checked);
        if (e.target.checked) {
          scheduleDailyWebsiteOpen();
        } else {
          clearDailyWebsiteOpen();
        }
      });
    });

    autoOpenLabel.appendChild(autoOpenCheckbox);
    autoOpenLabel.appendChild(document.createTextNode('Buka 5 tab otomatis (07:00)'));

    autoOpenDiv.appendChild(autoOpenLabel);

    // Remove menu when clicking outside
    setTimeout(() => {
      const clickOutsideHandler = (e) => {
        if (!e.target.closest('.settings-btn') && !e.target.closest('.settings-menu')) {
          const menu = document.querySelector('.settings-menu');
          if (menu) menu.remove();
          document.removeEventListener('click', clickOutsideHandler);
        }
      };
      document.addEventListener('click', clickOutsideHandler);
    }, 100);

  } else {
    console.log('User not authenticated, settings not available');
    // Show message that user needs to login
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
      position: absolute;
      top: 45px;
      right: 16px;
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 8px;
      padding: 8px 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      font-size: 12px;
      color: #856404;
    `;
    messageDiv.textContent = 'Login required';
    document.body.appendChild(messageDiv);

    setTimeout(() => {
      messageDiv.remove();
    }, 2000);
  }
}

function setLoginStatus(message, isError = false) {
  console.log('setLoginStatus called with:', message, 'isError:', isError);
  if (loginStatus) {
    loginStatus.textContent = message;
    loginStatus.className = isError ? 'login-status login-error' : 'login-status';
    console.log('Login status updated successfully');
  } else {
    console.error('loginStatus element not found!');
  }
}

// Form functions (only accessible when authenticated)
async function initializeForm() {
  try {
    populateWilayahOptions();

    const stored = await getStoredProfile();
    const profile = stored.profile || getDefaultProfile();

    applyProfileToForm(profile, stored.profileId || profile?.id || 'default');
  } catch (error) {
    console.error('Gagal inisialisasi form popup:', error);
    setStatus('Gagal memuat data.', true);
  }
}

async function initializeAutoToggle() {
  return new Promise((resolve) => {
    // Load saved setting
    getStoredAutoOpenSettings().then((settings) => {
      autoOpenCheckbox.checked = !!settings.enabled;
      resolve();
    });
  });
}

function populateWilayahOptions() {
  if (!wilayahSelect) return;

  wilayahSelect.innerHTML = '';
  wilayahData.forEach((wilayah) => {
    const option = document.createElement('option');
    option.value = wilayah.value;
    option.textContent = wilayah.label; // Hanya label tanpa nomor
    wilayahSelect.appendChild(option);
  });
}

function populateLokasiOptions(selectedWilayahValue, selectedLokasiValue) {
  if (!lokasiSelect) return;

  lokasiSelect.innerHTML = '';
  const wilayah = wilayahData.find((item) => item.value === selectedWilayahValue);
  const locations = wilayah?.locations || [];

  locations.forEach((lokasi) => {
    const option = document.createElement('option');
    option.value = lokasi.value;
    option.textContent = lokasi.label; // Hanya label tanpa nomor
    lokasiSelect.appendChild(option);
  });

  if (selectedLokasiValue && locations.some((item) => item.value === selectedLokasiValue)) {
    lokasiSelect.value = selectedLokasiValue;
  } else if (locations.length > 0) {
    lokasiSelect.selectedIndex = 0;
  }
}

function applyProfileToForm(profile, profileId = 'default') {
  if (!profile || !isAuthenticated) return;

  const wilayahValue = profile.wilayah || wilayahData[0]?.value;
  if (wilayahValue && wilayahSelect) {
    wilayahSelect.value = wilayahValue;
    populateLokasiOptions(wilayahValue, profile.lokasi);
  } else if (wilayahSelect) {
    populateLokasiOptions(wilayahData[0]?.value, profile.lokasi);
  }

  if (kkInput) kkInput.value = profile.kk || '';
  if (ktpInput) ktpInput.value = profile.ktp || '';
  if (kartuInput) kartuInput.value = profile.atm || '';
  if (tanggalLahirInput) tanggalLahirInput.value = profile.tanggalLahir || '';
  if (autoSubmitToggle) autoSubmitToggle.checked = !!profile.autoSubmit;

  setStatus('');
}

function handleWilayahChange() {
  if (!isAuthenticated) return;
  populateLokasiOptions(wilayahSelect.value);
}

async function handleSaveProfile() {
  if (!isAuthenticated || !validateForm()) {
    setStatus('Pastikan seluruh data terisi benar.', true);
    return;
  }

  const profile = {
    wilayah: wilayahSelect.value,
    lokasi: lokasiSelect.value,
    kk: kkInput.value.trim(),
    ktp: ktpInput.value.trim(),
    atm: kartuInput.value.trim(),
    tanggalLahir: tanggalLahirInput.value,
    autoSubmit: autoSubmitToggle.checked
  };

  chrome.storage.local.set({ [STORAGE_KEYS.PROFILE]: { profileId: 'default', profile } }, () => {
    setStatus('Profil tersimpan.');
  });
}

function handleReset(keepIdentityOnly) {
  if (!isAuthenticated) return;

  chrome.storage.local.get([STORAGE_KEYS.PROFILE], ({ [STORAGE_KEYS.PROFILE]: stored }) => {
    const baseProfile = keepIdentityOnly ?
      { ...stored?.profile, lokasi: '1', wilayah: stored?.profile?.wilayah || '1' } :
      getDefaultProfile();

    chrome.storage.local.set({ [STORAGE_KEYS.PROFILE]: { profileId: 'default', profile: baseProfile } }, () => {
      applyProfileToForm(baseProfile, 'default');
      setStatus(keepIdentityOnly ? 'Lokasi direset ke 1.' : 'Semua data dikembalikan.');
    });
  });
}

function validateForm() {
  if (!kkInput || !ktpInput || !kartuInput || !tanggalLahirInput || !wilayahSelect || !lokasiSelect) {
    return false;
  }

  const textValid = [kkInput, ktpInput, kartuInput].every((input) => input.value.trim().length >= 10);
  const dateValid = Boolean(tanggalLahirInput.value);

  return wilayahSelect.value && lokasiSelect.value && textValid && dateValid;
}

function setStatus(message, isError = false) {
  console.log('setStatus called with:', message, 'isError:', isError);
  if (statusText) {
    statusText.textContent = message;
    statusText.style.color = isError ? '#c0392b' : '#2c3e50';
    console.log('Status updated successfully');
  } else {
    console.error('statusText element not found!');
  }
}

function getStoredProfile() {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEYS.PROFILE], (result) => {
      resolve(result[STORAGE_KEYS.PROFILE] || {});
    });
  });
}

function getDefaultProfile() {
  // Return a default profile structure
  return {
    id: 'default',
    wilayah: wilayahData[0]?.value || '1',
    lokasi: '1',
    kk: '',
    ktp: '',
    atm: '',
    tanggalLahir: '',
    autoSubmit: false
  };
}

// Auto-refresh data from GitHub every hour
setInterval(async () => {
  try {
    await loadOnlineData();
    if (isAuthenticated) {
      // User biasa: inisialisasi form
      await initializeForm();
    }
  } catch (error) {
    console.error('Auto-refresh error:', error);
  }
}, 60 * 60 * 1000); // 1 hour

// Daily check for auto-open website at 07:00
let dailyWebsiteOpenInterval = null;

function scheduleDailyWebsiteOpen() {
  if (dailyWebsiteOpenInterval) {
    clearInterval(dailyWebsiteOpenInterval);
  }

  // Check every minute for 07:00 local time
  dailyWebsiteOpenInterval = setInterval(async () => {
    try {
      const settings = await getStoredAutoOpenSettings();

      if (!settings.enabled) {
        return; // Auto-open is disabled
      }

      // Use local device time (07:00)
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      // Check if it's 07:00 (local time)
      if (currentHour === 7 && currentMinute === 0) {
        console.log('🚀 Starting full automation: Opening 5 tabs at 07:00 WIB with auto-fill');

        // Get stored profile to check if auto-fill should run
        const profileData = await new Promise((resolve) => {
          chrome.storage.local.get([STORAGE_KEYS.PROFILE], (result) => {
            resolve(result[STORAGE_KEYS.PROFILE] || { profile: null });
          });
        });

        const isAutoFillEnabled = profileData.profile?.autoSubmit !== false; // Default to true if not set

        console.log('📋 Profile loaded, auto-fill enabled:', isAutoFillEnabled);

        let openedTabs = [];
        let completedTabs = 0;

        // Open 5 tabs simultaneously using configured URLs
        AUTO_OPEN_URLS.forEach((url, index) => {
          setTimeout(() => {
            chrome.tabs.create({ url: url }, (tab) => {
              if (chrome.runtime.lastError) {
                console.error('❌ Error opening tab:', chrome.runtime.lastError);
              } else {
                console.log(`✅ Tab ${index + 1} opened: ${url}`);
                openedTabs.push(tab);

                // Wait for tab to load completely, then run autofill if enabled
                chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo, tabInfo) {
                  if (tabId === tab.id && changeInfo.status === 'complete') {
                    chrome.tabs.onUpdated.removeListener(listener);

                    console.log(`🔄 Tab ${index + 1} fully loaded, checking auto-fill...`);

                    // Run autofill on this tab if auto-fill is enabled
                    if (isAutoFillEnabled) {
                      setTimeout(() => {
                        console.log(`🤖 Running auto-fill on tab ${index + 1}...`);
                        chrome.tabs.sendMessage(tabId, { action: 'runAutofill' }, (response) => {
                          completedTabs++;
                          if (response && response.success) {
                            console.log(`✅ Auto-fill SUCCESS on tab ${completedTabs}/${openedTabs.length}`);
                          } else {
                            const errorMsg = response ? response.error : 'No response from content script';
                            console.error(`❌ Auto-fill FAILED on tab ${completedTabs}:`, errorMsg);
                          }

                          // Check if all tabs completed
                          if (completedTabs >= openedTabs.length) {
                            console.log('🎉 FULL AUTOMATION COMPLETED: All tabs opened and processed');
                          }
                        });
                      }, 3000); // Wait 3 seconds after page load for maximum stability
                    } else {
                      console.log(`⚠️ Auto-fill disabled for tab ${index + 1}, marking as completed`);
                      completedTabs++;
                      if (completedTabs >= openedTabs.length) {
                        console.log('✅ All tabs opened successfully (auto-fill disabled)');
                      }
                    }
                  }
                });
              }
            });
          }, index * 1000); // Stagger opening by 1 second for better reliability
        });

        // Fallback timeout in case some tabs don't complete
        setTimeout(() => {
          if (completedTabs < openedTabs.length) {
            console.warn(`⏰ Automation timeout: ${openedTabs.length} tabs opened, ${completedTabs} completed`);
          } else {
            console.log('🎯 Automation completed successfully within timeout');
          }
        }, 45000); // 45 second timeout for full automation
      }
    } catch (error) {
      console.error('❌ Error in daily automation:', error);
    }
  }, 60 * 1000); // Check every minute

  console.log('⏰ Daily automation scheduled for 07:00 WIB (5 tabs + auto-fill)');
}

function clearDailyWebsiteOpen() {
  if (dailyWebsiteOpenInterval) {
    clearInterval(dailyWebsiteOpenInterval);
    dailyWebsiteOpenInterval = null;
    console.log('Daily website open cleared');
  }
}

// Settings functions
function updateSettingsUserInfo() {
  if (!settingsUserId || !settingsUserStatus || !settingsUserExpiry) return;

  if (isAuthenticated && currentUser) {
    settingsUserId.textContent = currentUser.id;
    settingsUserStatus.textContent = 'Aktif';

    // Update expiration display for settings page
    if (currentUser && currentUser.expires_at) {
      const now = new Date();
      const expiryDate = new Date(currentUser.expires_at);
      const isExpired = expiryDate < now;
      const timeDiff = expiryDate.getTime() - now.getTime();
      const daysRemaining = Math.ceil(timeDiff / (24 * 60 * 60 * 1000));

      let expiryText = '';
      let expiryClass = '';

      if (isExpired) {
        expiryText = 'Akun Kadaluarsa';
        expiryClass = 'expired';
      } else if (daysRemaining <= 7) {
        expiryText = `Kadaluarsa dalam ${daysRemaining} hari`;
        expiryClass = 'warning';
      } else {
        expiryText = `Aktif hingga ${expiryDate.toLocaleDateString('id-ID')}`;
        expiryClass = '';
      }

      settingsUserExpiry.textContent = expiryText;
      settingsUserExpiry.className = `profile-value ${expiryClass}`;
    } else {
      settingsUserExpiry.textContent = '-';
      settingsUserExpiry.className = 'profile-value';
    }
  } else {
    settingsUserId.textContent = 'Guest';
    settingsUserStatus.textContent = 'Tidak Login';
    settingsUserExpiry.textContent = '-';
    settingsUserExpiry.className = 'profile-value';
  }
}

async function initializeSettings() {
  try {
    console.log('Initializing settings...');

    // Load saved auto-open settings
    const settings = await getStoredAutoOpenSettings();
    console.log('Loaded auto-open settings:', settings);

    // Update UI with saved settings
    if (autoOpenWebsiteToggle) {
      autoOpenWebsiteToggle.checked = !!settings.enabled;
      console.log('Auto-open toggle set to:', settings.enabled);
    }

    if (autoFillToggle) {
      autoFillToggle.checked = true; // Default to enabled
    }

    // Show/hide time settings based on SAVED toggle state
    toggleAutoOpenTimeSettings(settings.enabled);

    // Ensure scheduler is running if auto-open was enabled
    if (settings.enabled) {
      console.log('Auto-open was enabled, ensuring scheduler is running...');
      scheduleDailyWebsiteOpen();
    } else {
      console.log('Auto-open was disabled, ensuring scheduler is cleared...');
      clearDailyWebsiteOpen();
    }

    console.log('Settings initialized successfully');
  } catch (error) {
    console.error('Error initializing settings:', error);
  }
}

function handleAutoOpenToggle() {
  const isEnabled = autoOpenWebsiteToggle?.checked || false;
  toggleAutoOpenTimeSettings(isEnabled);

  // Save current state (fixed time 07:00)
  const settings = {
    enabled: isEnabled,
    hour: '7', // Fixed to 07:00
    minute: '0', // Fixed to :00
    timezone: 'Asia/Jakarta' // Fixed timezone
  };

  chrome.storage.local.set({ [STORAGE_KEYS.AUTO_OPEN_SETTINGS]: settings }, () => {
    console.log('Auto-open settings saved:', settings);
    if (isEnabled) {
      scheduleDailyWebsiteOpen();
    } else {
      clearDailyWebsiteOpen();
    }
  });
}

function toggleAutoOpenTimeSettings(enabled) {
  const timeSettings = document.getElementById('timeSettings');
  if (timeSettings) {
    timeSettings.style.display = enabled ? 'block' : 'none';
  }
}

async function handleSaveAutoOpenSettings() {
  try {
    const settings = {
      enabled: autoOpenWebsiteToggle?.checked || false,
      hour: '7', // Fixed to 07:00
      minute: '0', // Fixed to :00
      timezone: 'Asia/Jakarta' // Fixed timezone
    };

    chrome.storage.local.set({ [STORAGE_KEYS.AUTO_OPEN_SETTINGS]: settings }, () => {
      if (chrome.runtime.lastError) {
        alert('❌ Error: Gagal menyimpan pengaturan!\n' + chrome.runtime.lastError.message);
        console.error('Save settings error:', chrome.runtime.lastError);
      } else {
        alert('✅ Pengaturan berhasil disimpan!\n\n⏰ Auto-open: ' + (settings.enabled ? 'Aktif' : 'Nonaktif') + '\n🕐 Waktu: 07:00 WIB (Tetap)');
        console.log('Auto-open settings saved:', settings);

        if (settings.enabled) {
          scheduleDailyWebsiteOpen();
        } else {
          clearDailyWebsiteOpen();
        }
      }
    });
  } catch (error) {
    alert('❌ Error: Terjadi kesalahan sistem!');
    console.error('Save settings error:', error);
  }
}
async function handleTestAutoOpen() {
  try {
    console.log('🚀 TEST FUNCTION CALLED');

    // Check toggle states
    const autoOpenEnabled = autoOpenWebsiteToggle?.checked || false;
    const autoFillEnabled = autoFillToggle?.checked !== false; // Default to enabled if not set

    console.log('Toggle states:', { autoOpenEnabled, autoFillEnabled });

    if (!autoOpenEnabled) {
      alert('❌ Error: Aktifkan dulu toggle Auto-Open Website untuk test!');
      return;
    }

    console.log('✅ Starting test with', AUTO_OPEN_URLS.length, 'tabs');

    // Show loading message
    const testBtn = document.getElementById('testFeatures');
    const originalText = testBtn.textContent;
    testBtn.textContent = 'Membuka tabs...';
    testBtn.disabled = true;

    let openedTabs = [];
    let completedTabs = 0;

    // Open 5 tabs simultaneously using configured URLs
    AUTO_OPEN_URLS.forEach((url, index) => {
      setTimeout(() => {
        chrome.tabs.create({ url: url }, (tab) => {
          if (chrome.runtime.lastError) {
            console.error('❌ Error opening tab:', chrome.runtime.lastError);
          } else {
            console.log(`✅ Tab ${index + 1} opened: ${url}`);
            openedTabs.push(tab);

            // Wait for tab to load completely, then run autofill if enabled
            chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo, tabInfo) {
              if (tabId === tab.id && changeInfo.status === 'complete') {
                chrome.tabs.onUpdated.removeListener(listener);

                console.log(`🔄 Tab ${index + 1} fully loaded, checking auto-fill...`);

                // Run autofill on this tab if auto-fill is enabled
                if (autoFillEnabled) {
                  setTimeout(() => {
                    console.log(`🤖 Running auto-fill on tab ${index + 1}...`);
                    chrome.tabs.sendMessage(tabId, { action: 'runAutofill' }, (response) => {
                      completedTabs++;
                      if (response && response.success) {
                        console.log(`✅ Auto-fill SUCCESS on tab ${completedTabs}/${openedTabs.length}`);
                      } else {
                        const errorMsg = response ? response.error : 'No response from content script';
                        console.error(`❌ Auto-fill FAILED on tab ${completedTabs}:`, errorMsg);
                      }

                      // Check if all tabs completed
                      if (completedTabs >= openedTabs.length) {
                        console.log('🎉 TEST COMPLETED: All tabs opened and processed');
                      }
                    });
                  }, 3000); // Wait 3 seconds after page load for maximum stability
                } else {
                  console.log(`⚠️ Auto-fill disabled for tab ${index + 1}, marking as completed`);
                  completedTabs++;
                  if (completedTabs >= openedTabs.length) {
                    console.log('✅ All tabs opened successfully (auto-fill disabled)');
                  }
                }
              }
            });
          }
        });
      }, index * 1000); // Stagger opening by 1 second for better reliability
    });

    // Final result
    setTimeout(() => {
      testBtn.textContent = originalText;
      testBtn.disabled = false;

      const successCount = openedTabs.length;
      const fillStatus = autoFillEnabled ? 'dengan auto-fill' : 'tanpa auto-fill';

      console.log(`🎉 Test completed: ${successCount} tabs opened, ${fillStatus}`);
      alert(`✅ Test selesai!\n\n📋 ${successCount} tab berhasil dibuka\n🤖 Diisi ${fillStatus}\n\n⏰ Auto-open harian: 07:00 WIB`);
    }, 1000);

  } catch (error) {
    console.error('❌ Test function error:', error);
    alert('❌ Error: Gagal menjalankan test!');

    // Restore button
    const testBtn = document.getElementById('testFeatures');
    if (testBtn) {
      testBtn.textContent = 'Test Sekarang';
      testBtn.disabled = false;
    }
  }
}

function getStoredAutoOpenSettings() {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEYS.AUTO_OPEN_SETTINGS], (result) => {
      const settings = result[STORAGE_KEYS.AUTO_OPEN_SETTINGS] || {
        enabled: false,
        hour: '7', // Fixed to 07:00
        minute: '0', // Fixed to :00
        timezone: 'Asia/Jakarta'
      };
      resolve(settings);
    });
  });
}
