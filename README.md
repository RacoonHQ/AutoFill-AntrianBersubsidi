# Form Otomatis Paket Sembako - Sistem Membership

## Ringkasan
Proyek ini adalah ekstensi Chrome berbasis Manifest V3 dengan **sistem autentikasi dan membership** yang membantu mengisi formulir antrian pangan bersubsidi secara otomatis. Sistem ini dirancang untuk **penjualan membership** dengan kontrol akses berbasis user dan password.

## Fitur Utama

### 🔐 Sistem Autentikasi & Membership
- **Login System**: Pengguna harus login dengan User ID dan Password sebelum dapat menggunakan ekstensi
- **Role-based Access**: Sistem mendukung role admin dan user
- **Session Management**: Login session berlaku selama 24 jam

### 📊 Data Management
- **Single Repository System**: Semua data diambil dari satu repository GitHub
- **Auto-sync**: Data tersinkronisasi otomatis setiap jam dari repository online
- **Independent Updates**: Update data tanpa mempengaruhi komponen lain
- **Local Fallback**: Jika repository tidak tersedia, menggunakan data lokal sebagai cadangan

### 💎 Keuntungan Sistem Single Repository

1. **🔄 Update Mudah**: Update semua data dalam satu tempat
2. **🛡️ Backup Strategy**: Jika repository bermasalah, fallback ke data lokal
3. **📊 Analytics Terpisah**: Track semua update dalam satu repository
4. **🔐 Security Options**: Repository bisa private untuk keamanan maksimal
5. **⚡ Performance**: Load dari satu repository lebih sederhana
6. **🛠️ Maintenance Mudah**: Setup dan manage lebih simpel

## Model Bisnis dengan Single Repository

### 🎯 Strategi Update
- **Repository Tunggal**: Update semua data dalam satu repository
- **Zero Downtime**: Fallback ke data lokal jika GitHub error
- **Auto-sync**: Update otomatis setiap jam dari repository
- **Local Fallback**: Jika salah satu repository tidak tersedia, menggunakan data lokal sebagai cadangan

### 🏪 Membership System untuk Penjualan
- **Admin Panel**: Interface khusus untuk admin mengelola pengguna
- **User Management**: Tambah, aktifkan/nonaktifkan, hapus pengguna
- **Subscription Control**: Atur masa berlaku membership untuk setiap pengguna
- **Revenue Model**: Cocok untuk model bisnis membership berbayar

### 🤖 Fitur Autofill (Seperti Sebelumnya)
- **Autofill Form** di halaman `https://antrianpanganbersubsidi.pasarjaya.co.id/`
- **Pengaturan Profil** melalui popup dengan autentikasi
- **Mode otomatis terjadwal** dan screenshot otomatis


### 1. Setup GitHub Repository
1. **Repository Anda sudah siap**: `https://github.com/RacoonHQ/KJP`
2. **Upload struktur file** sebagai berikut:
   ```
   KJP/
   ├── data/
   │   ├── user.json     # Data pengguna & membership
   │   └── profiles.json # Data wilayah & lokasi
   └── README.md
   ```

### 2. Setup User Database (`data/user.json`)
```json
{
  "users": [
    {
      "id": "admin",
      "password": "admin123",
      "created_at": "2025-01-01",

### 3. Setup Profiles Database (`data/profiles.json`)
```json
{
  "wilayah": [
    {
      "value": "1",
      "label": "JAKARTA PUSAT",
      "locations": [
        { "value": "2", "label": "Jakmart Cikini" },
        { "value": "3", "label": "Jakmart Kenari" }
      ]
    }
  ]
}
```

## Cara Menggunakan

### Untuk Admin
1. **Login** dengan User ID dan Password admin
2. **Admin Panel** akan muncul dengan fitur:
   - Lihat daftar semua pengguna
   - Tambah pengguna baru dengan masa berlaku
   - Aktifkan/nonaktifkan pengguna
   - Hapus pengguna
   - Sinkronisasi data dari GitHub

### Untuk Pengguna Biasa
1. **Login** dengan User ID dan Password yang diberikan admin
2. **Isi profil** data diri (KK, KTP, dll) setelah login berhasil
3. **Gunakan autofill** seperti biasa setelah ter-authentikasi

### Model Bisnis Membership
1. **Setup Admin Account**: Admin mengatur sistem dan menambah pengguna
2. **Jual Akses**: Jual User ID dan Password dengan masa berlaku tertentu
3. **Update Repository**: Admin update `data/user.json` di GitHub untuk mengelola pengguna baru
4. **Auto-sync**: Pengguna otomatis mendapat update ketika membuka ekstensi

## Instalasi & Setup

### 1. Instalasi Ekstensi
Ikuti langkah instalasi manual seperti sebelumnya di bagian "Instalasi Manual".

### 2. Setup Repository GitHub
1. Pastikan file `data/user.json` dan `data/profiles.json` tersedia di repository publik
2. Update URL repository di `popup.js` baris 10

### 3. Testing Sistem
1. **Test Login**: Gunakan credential admin untuk test sistem
2. **Test User Management**: Admin bisa tambah user baru melalui interface
3. **Test Autofill**: Pastikan autofill hanya berjalan setelah login berhasil

## Keamanan & Best Practices

### Untuk Admin
- **Secure Passwords**: Gunakan password yang kuat untuk akun admin
- **Repository Security**: Pertimbangkan private repository untuk data sensitif
- **Regular Updates**: Update masa berlaku membership secara berkala
- **Backup Data**: Backup data pengguna secara berkala

### Untuk Pengguna
- **Session Timeout**: Login session berlaku 24 jam, perlu login ulang setelahnya
- **Data Privacy**: Data profil disimpan lokal di browser pengguna
- **Auto-sync**: Data selalu terupdate dari repository admin

## Troubleshooting

### Masalah Login
- **"User ID atau Password salah"**: Pastikan credential benar dan akun aktif
- **"Gagal memuat data sistem"**: Periksa koneksi internet dan akses ke GitHub repository

### Masalah Autofill
- **"User not authenticated"**: Pastikan sudah login dengan benar
- **Data tidak muncul**: Periksa apakah data berhasil disinkronisasi dari GitHub

### Masalah Admin Panel
- **Tidak bisa tambah user**: Pastikan login sebagai admin
- **User list kosong**: Periksa format `data/user.json` dan koneksi GitHub

## Pengembangan Lanjutan

### Fitur yang Bisa Ditambahkan
- **Payment Integration**: Integrasi dengan payment gateway untuk pembayaran otomatis
- **Email Notifications**: Notifikasi ketika membership hampir expired
- **Analytics Dashboard**: Tracking penggunaan dan statistik membership
- **API Integration**: Webhook untuk automasi pembayaran dan user management

### Customization
- **Custom Branding**: Ubah warna dan logo sesuai brand Anda
- **Additional Fields**: Tambah field profil sesuai kebutuhan
- **Multi-language**: Dukungan bahasa tambahan
- **Mobile Support**: Optimasi untuk pengguna mobile

---

## Lisensi & Kredit
- **Model Bisnis**: Sistem ini dirancang untuk model bisnis membership berbayar
- **Pengembang**: RacoonHQ — Sayyid Abdullah Azzam
- **Versi**: 2.0.0 (dengan sistem autentikasi dan membership)

**Catatan Penting**: Sistem ini cocok untuk dijual sebagai membership service. Pastikan compliance dengan regulasi dan kebijakan platform distribusi yang digunakan.

## Fitur Utama
- **Autofill Form** di halaman `https://antrianpanganbersubsidi.pasarjaya.co.id/` berdasarkan profil yang disimpan.
- **Pengaturan Profil** melalui `popup.html`:
  - Pilih wilayah dan lokasi menggunakan data numerik (lihat `data/profiles.json`).
  - Simpan nomor KK/KTP/kartu dan tanggal lahir.
  - Toggle **Klik Tombol Simpan Otomatis** agar konten (`content.js`) menekan tombol `#daterange-btn` setelah data terisi.
  - Pilihan **Reset Tempat** (set lokasi ke 1 tanpa menghapus data identitas) dan **Reset Semua** (kembalikan ke profil default kosong).
- **Mode otomatis terjadwal** melalui toggle `#autoToggle` (mengatur flag `autoMode` di `chrome.storage.local`).
- **Logging & Screenshot Trigger** (`content.js`) mendeteksi QR code pasca submit dan mengirim pesan ke `background.js` untuk menangkap tangkapan layar (bila diimplementasikan).

## Struktur Direktori
```
Script Form/
├── background.js         # Service worker untuk tugas background (mis. screenshot)
├── content.js            # Script yang dijalankan di halaman target untuk autofill
├── popup.html            # UI popup utama
├── popup.js              # Logika interaksi popup & penyimpanan profil
├── data/profiles.json    # Wilayah/lokasi & profil default
├── manifest.json         # Deklarasi ekstensi Manifest V3
├── icon.png              # Ikon ekstensi (128x128 + varian 16px)
└── README.md             # Dokumentasi proyek ini
```

## Persyaratan
- Google Chrome / Microsoft Edge versi terbaru dengan dukungan Manifest V3.
- Hak akses untuk mengaktifkan mode pengembang di `chrome://extensions`.
- Sistem operasi Windows (instruksi serupa berlaku untuk macOS/Linux dengan penyesuaian path).

## Instalasi Manual (Disarankan)
Ikuti panduan berikut agar ekstensi terpasang permanen di profil Chrome Anda.

### 1. Siapkan Folder Ekstensi
- **Clone repository** dengan `git clone https://github.com/RacoonHQ/script-form.git` **atau**
- **Unduh ZIP** dari tombol *Code ▸ Download ZIP*, lalu ekstrak ke folder yang mudah diakses, mis. `C:\Users\<nama>\Documents\Script Form`.

### 2. Aktifkan Mode Pengembang Chrome
1. Buka Google Chrome.
2. Masuk ke `chrome://extensions/`.
3. Geser toggle **Developer mode** (pojok kanan atas) hingga berwarna biru.

### 3. Muat Ekstensi
1. Masih di halaman `chrome://extensions/`, klik tombol **Load unpacked**.
2. Arahkan ke folder `Script Form` (folder yang berisi `manifest.json`, bukan folder induknya).
3. Klik **Select Folder**. Chrome akan menambahkan kartu ekstensi “Form Otomatis Paket Sembako”.

### 4. Verifikasi & Pin Ikon (Opsional)
- Pastikan kartu ekstensi bertuliskan “Form Otomatis Paket Sembako” dan toggle di pojok kanan bawah kartu dalam posisi ON.
- Klik ikon puzzle di toolbar Chrome ▸ pin ekstensi agar mudah diakses.

### 5. Memperbarui Ekstensi
- Setelah mengubah file (mis. `data/profiles.json`, `popup.js`, `content.js`), buka kembali `chrome://extensions/`.
- Klik tombol **Reload** pada kartu ekstensi untuk memuat ulang perubahan.

### 6. Menghapus Ekstensi
- Di `chrome://extensions/`, klik tombol **Remove** pada kartu ekstensi jika ingin mencopotnya dari Chrome.
- Anda dapat meng-install kembali kapan pun dengan mengulang langkah di atas.

## Instalasi via Command Line (Opsional)
Chrome tidak mengizinkan instalasi otomatis dari GitHub tanpa pengguna mengekstrak maupun menyetujui pemasangan. Namun, Anda dapat menjalankan Chrome dengan parameter `--load-extension` untuk kebutuhan pengujian lokal:

```powershell
"C:\Program Files\Google\Chrome\Application\chrome.exe" --load-extension="e:\Users\Documents\PROJECT_WEBSITE\Script Form"
```

Perintah di atas **tidak** memasang permanen; ekstensi dimuat sementara selama sesi Chrome tersebut terbuka. Untuk penggunaan sehari-hari, ikuti langkah instalasi manual.

> **Catatan:** Chrome melarang distribusi otomatis ekstensi di luar Chrome Web Store tanpa interaksi pengguna. Untuk sharing publik, paketkan sebagai ZIP (Menu ekstensi → `Pack extension`) kemudian distribusikan file `.crx` + `.pem`, atau unggah ke Chrome Web Store mengikuti kebijakan Google.

## Konfigurasi Profil
- File `data/profiles.json` memuat:
  - `profiles`: profil default dengan field kosong.
  - `wilayah`: daftar wilayah dengan array `locations` (value numerik mengikuti opsi di website, label menampilkan teks).
- Ketika pengguna **Simpan** di popup, `popup.js` menyimpan objek `{ profileId, profile }` ke `chrome.storage.local` dengan key `profileData`.
- `content.js` akan memprioritaskan data dari storage; jika kosong, memakai profil default dari JSON.

## Cara Menggunakan
1. Klik ikon ekstensi (pin terlebih dahulu jika perlu) untuk membuka popup.
2. Isi **ID Profil** (opsional). Jika dikosongkan, ekstensi memakai ID `default`.
3. Pilih **Wilayah** dan **Lokasi** sesuai kebutuhan.
4. Masukkan nomor **KK**, **KTP**, **Nomor Kartu**, serta **Tanggal Lahir** (format `YYYY-MM-DD`).
5. Centang **Klik Tombol Simpan Otomatis** jika ingin `content.js` menekan tombol submit otomatis setelah autofill.
6. Tekan **Simpan**.
7. Buka halaman `https://antrianpanganbersubsidi.pasarjaya.co.id/`, lalu di popup klik **Jalankan** untuk memicu autofill.
8. Jika CAPTCHA perlu diisi manual, isi terlebih dahulu; ekstensi otomatis mencentang checkbox `#box` dan men-submit bila toggle aktif.

### Tombol tambahan di Popup
- **Reset Tempat**: mempertahankan data identitas tetapi mengatur `lokasi` ke `1`.
- **Reset Semua**: mengembalikan seluruh field ke profil default (kosong) dari `data/profiles.json`.
- **Buka Situs**: membuka laman target pada tab baru.

## Pengembangan & Kustomisasi
- Sesuaikan daftar wilayah/lokasi di `data/profiles.json` agar mengikuti nilai `value` dari elemen `<option>` pada situs.
- Tambahkan logging atau integrasi tambahan di `background.js` bila perlu (mis. screenshot otomatis).
- Pastikan setiap perubahan diuji dengan tekan **Reload** di `chrome://extensions/`.

## Troubleshooting
- **Dropdown tidak memilih lokasi**: pastikan nilai `value` di `data/profiles.json` cocok dengan atribut `value` pada `<option>` situs (lihat DevTools > Elements).
- **Submit otomatis tidak jalan**: verifikasi toggle “Klik Tombol Simpan Otomatis” di popup dan pastikan tombol hadir dengan ID `daterange-btn`.
- **Profil tidak tersimpan**: periksa permission `storage` di `manifest.json` dan pastikan tidak ada error di `chrome://extensions/` → *Errors*.

---
Selamat menggunakan! Untuk kontribusi lebih lanjut, ajukan pull request atau issue di repository GitHub Anda.

## Lisensi & Kredit
- **Penggunaan**: Konten ini boleh digunakan dan dimodifikasi untuk keperluan pribadi maupun organisasi selama **tidak diperjualbelikan**.
- **Pengembang**: RacoonHQ — Sayyid Abdullah Azzam
- **GitHub**: [github.com/RacoonHQ](https://github.com/RacoonHQ)
