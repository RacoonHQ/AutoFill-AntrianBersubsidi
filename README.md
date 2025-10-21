# Form Otomatis Paket Sembako

## Ringkasan
Ekstensi Chrome sederhana untuk membantu mengisi formulir antrian pangan bersubsidi secara otomatis dengan sistem autentikasi untuk keamanan pengguna.

## 🔒 Kebijakan Privasi
**PENTING:** Data yang Anda masukkan hanya disimpan sementara di local storage browser Anda dan **TIDAK PERNAH** dikirim atau disimpan ke server manapun. Kami menghormati privasi Anda dan tidak mengumpulkan data pribadi apapun. Data akan otomatis terhapus ketika Anda menutup browser atau membersihkan cache.

## Cara Setup

### 1. Instalasi Ekstensi
1. Buka Google Chrome dan masuk ke `chrome://extensions/`
2. Aktifkan **Developer mode** (pojok kanan atas)
3. Klik **Load unpacked**
4. Pilih folder `Script Form` (folder yang berisi `manifest.json`)
5. Ekstensi akan terinstall dengan nama "Form Otomatis Paket Sembako"

### 2. Konfigurasi Git Repository
1. Repository sudah dikonfigurasi: `https://github.com/RacoonHQ/AutoFill-AntrianBersubsidi.git`
2. Ekstensi akan otomatis mengambil data dari repository ini
3. Tidak perlu konfigurasi tambahan untuk pengguna biasa

## Cara Login & Penggunaan

### 1. Login ke Sistem
1. Klik ikon ekstensi di toolbar Chrome
2. Masukkan **User ID** dan **Password** yang sudah disediakan
3. Klik tombol **Login**

### 2. Kredensial Default (untuk testing)
- **User ID:** `user01` | **Password:** `user01`

### 3. Setup Profil Setelah Login
1. Setelah login berhasil, klik tab **"Form Profil"**
2. Pilih **Wilayah** dan **Lokasi** sesuai kebutuhan Anda
3. Masukkan data pribadi:
   - **No. Kartu Keluarga** (16 digit)
   - **No. KTP** (16 digit)
   - **No. Kartu ATM** (16 digit)
   - **Tanggal Lahir** (format: YYYY-MM-DD)
4. Klik **Simpan** untuk menyimpan profil

### 4. Menggunakan Auto-Fill
1. Buka website `https://antrianpanganbersubsidi.pasarjaya.co.id/`
2. Klik ikon ekstensi lagi
3. Klik tombol **"Jalankan Auto-Fill"**
4. Sistem akan otomatis mengisi formulir dengan data profil Anda
5. Jika ada CAPTCHA, isi manual terlebih dahulu
6. Sistem akan otomatis submit formulir

## Fitur Tambahan

### Pengaturan Otomatis
- **Auto-open 5 tabs** setiap hari pukul 07:00 pagi
- Aktifkan melalui **Settings** → centang "Buka 5 tab otomatis (07:00)"

### Reset Data
- **Reset Tempat:** Mengatur ulang lokasi tanpa menghapus data identitas
- **Reset Semua:** Mengembalikan semua data ke pengaturan awal

## Troubleshooting

### Masalah Login
- Pastikan User ID dan Password benar
- Periksa koneksi internet untuk sinkronisasi data

### Masalah Auto-Fill
- Pastikan sudah login dengan benar
- Pastikan website yang dibuka adalah `https://antrianpanganbersubsidi.pasarjaya.co.id/`
- Coba refresh halaman jika autofill tidak berfungsi

### Data Tidak Muncul
- Klik tombol **"Jalankan Auto-Fill"** di popup ekstensi
- Pastikan profil sudah disimpan dengan benar

## Keamanan
- ✅ Data hanya disimpan lokal di browser Anda
- ✅ Tidak ada pengiriman data ke server
- ✅ Data terhapus otomatis saat browser ditutup
- ✅ Sistem autentikasi untuk keamanan akses

## Support
Jika mengalami masalah, silakan hubungi admin sistem untuk mendapatkan kredensial login atau bantuan teknis.

---
**Versi:** 2.0.1 | **Pengembang:** RacoonHQ
