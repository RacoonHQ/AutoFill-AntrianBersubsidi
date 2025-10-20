// Fungsi untuk mengupdate jam di popup
function updateClock() {
  const formatTime = (num) => num < 10 ? `0${num}` : num;

  const fetchBMKGTime = async () => {
    try {
      const response = await fetch('https://worldtimeapi.org/api/timezone/Asia/Jakarta');
      if (!response.ok) throw new Error('WorldTimeAPI response not ok');
      
      const data = await response.json();
      const dateTime = new Date(data.datetime);
      
      const timeStr = `${formatTime(dateTime.getHours())}:${formatTime(dateTime.getMinutes())}:${formatTime(dateTime.getSeconds())} WIB`;
      
      return {
        time: timeStr,
        date: dateTime.toLocaleDateString('id-ID')
      };
    } catch (error) {
      const now = new Date();
      return {
        time: `${formatTime(now.getHours())}:${formatTime(now.getMinutes())}:${formatTime(now.getSeconds())}`,
        date: now.toLocaleDateString('id-ID')
      };
    }
  };

  const update = async () => {
    try {
      const { time, date } = await fetchBMKGTime();
      
      const timeElement = document.getElementById('bmkgTime');
      const dateElement = document.getElementById('bmkgDate');
      
      if (timeElement) timeElement.textContent = time;
      if (dateElement) dateElement.textContent = date;
      
      setTimeout(update, 1000);
    } catch (error) {
      setTimeout(update, 1000);
    }
  };

  update();
}

// Jalankan saat dokumen siap
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(updateClock, 1000);
});
