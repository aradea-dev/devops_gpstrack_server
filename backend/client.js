const WebSocket = require('ws');

// Hubungkan simulator ke server utama di port 3000
const ws = new WebSocket('ws://localhost:3000');

ws.on('open', () => {
    console.log('📡 Simulator GPS Aktif. Mulai mengirim data...');

    // Koordinat awal (Monas, Jakarta)
    let lat = -6.175392;
    let lon = 106.827153;

    // Kirim data setiap 3 detik sekali
    setInterval(() => {
        // Simulasi pergerakan kecil (seolah-olah kendaraan berjalan)
        lat += (Math.random() - 0.5) * 0.02;
        lon += (Math.random() - 0.5) * 0.02;
        const speed = Math.floor(Math.random() * 40) + 20; // Kecepatan acak 20-60 km/jam

        const payload = {
            device_id: 'TRUCK-01',
            lat: lat.toFixed(6),
            lon: lon.toFixed(6),
            speed: speed
        };

        ws.send(JSON.stringify(payload));
        console.log(`🚀 Dikirim: ${payload.device_id} -> Lat: ${payload.lat}, Lon: ${payload.lon} | Speed: ${speed} km/h`);
    }, 3000);
});

ws.on('error', (error) => {
    console.error('❌ Gagal terhubung ke server:', error.message);
});

ws.on('close', () => {
    console.log('❌ Koneksi simulator diputus.');
});
