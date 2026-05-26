const WebSocket = require('ws');
const { Pool } = require('pg');

// 1. KONEKSI DATABASE
//const dbClient = new Client({
   // user: 'admin',
   // host: 'db-gps', // Pakai nama service jika di dalam Docker Compose yang sama
   // database: 'gps_tracking',
   // password: 'password_rahasia',
   // port: 5432,
//});

// 1. KONEKSI DATABASE (MENGGUNAKAN POOL)
const pool = new Pool({
    user: 'admin',
    host: 'db-gps', // Nama service di Docker Compose
    database: 'gps_tracking',
    password: 'password_rahasia',
    port: 5432,
    max: 20, // Batas maksimal koneksi simultan otomatis
});

// QUERY UNTUK MEMBUAT TABEL OTOMATIS JIKA BELUM ADA
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS gps_data (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(50) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    speed REAL,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  );
`;

// Inisialisasi Koneksi dan Pembuatan Tabel
async function initDatabase() {
    try {
        // Cek koneksi sekaligus jalankan query pembuatan tabel
        await pool.query(createTableQuery);
        console.log('🐘 Connected to PostgreSQL');
        console.log('✅ Table "gps_data" is ready!');
    } catch (err) {
        console.error('❌ DB Connection / Table Creation Error:', err.message);
    }
}

initDatabase();
//dbClient.connect()
    //.then(() => console.log('🐘 Connected to PostgreSQL'))
   // .catch(err => console.error('❌ DB Connection Error:', err.stack));

// 2. JALANKAN WEBSOCKET MURNI DI PORT 3000
const wss = new WebSocket.Server({ port: 3000 }, () => {
    console.log("🚀 Backend WebSocket Server running on port 3000");
});

wss.on('connection', (ws) => {
    console.log('📡 GPS Device or Frontend Connected via Nginx');

    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);
            
            // SIMPAN KE DB
            const query = `INSERT INTO gps_data (device_id, latitude, longitude, speed) VALUES ($1, $2, $3, $4)`;
            const values = [data.device_id, parseFloat(data.lat), parseFloat(data.lon), parseInt(data.speed || 0)];
            console.log(`📥 Received data from ${data.device_id}: Lat ${data.lat}, Lon ${data.lon}`);
	   // await dbClient.query(query, values);
            await pool.query(query,values);

            // BROADCAST KE FRONTEND
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(data));
                }
            });
        } catch (error) {
            console.error('⚠️ Error:', error.message);
        }
    });
});
