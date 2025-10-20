// Fungsi untuk mendapatkan waktu dari BMKG atau API alternatif
async function getBMKGTime() {
  try {
    // Coba API publik yang lebih reliable untuk waktu Indonesia
    const response = await fetch('https://worldtimeapi.org/api/timezone/Asia/Jakarta');
    
    if (!response.ok) {
      throw new Error('WorldTimeAPI response not ok');
    }
    
    const data = await response.json();
    const dateTime = new Date(data.datetime);
    
    const hours = dateTime.getHours();
    const minutes = dateTime.getMinutes();
    const seconds = dateTime.getSeconds();
    const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} WIB`;
    const dateStr = dateTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    return {
      hours,
      minutes,
      seconds,
      timeString: timeStr,
      dateString: dateTime.toLocaleDateString('id-ID'),
      fullDate: dateStr,
      source: 'worldtimeapi'
    };
  } catch (error) {
    console.warn('❌ Gagal fetch waktu dari WorldTimeAPI, fallback ke waktu lokal:', error.message);
    const now = new Date();
    return {
      hours: now.getHours(),
      minutes: now.getMinutes(),
      seconds: now.getSeconds(),
      timeString: now.toTimeString().substring(0, 8) + ' WIB',
      dateString: now.toLocaleDateString('id-ID'),
      fullDate: now.toLocaleString('id-ID'),
      source: 'local'
    };
  }
}

// Ekspor fungsi yang diperlukan
window.BMKGTime = {
  getBMKGTime
};
