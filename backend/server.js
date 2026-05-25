const WebSocket = require('ws');
const { Client } = require('pg');

// 1. KONEKSI DATABASE
const dbClient = new Client({
    user: 'admin',
    host: 'db-gps', // Pakai nama service jika di dalam Docker Compose yang sama
    database: 'gps_tracking',
    password: 'password_rahasia',
    port: 5432,
});

dbClient.connect()
    .then(() => console.log('🐘 Connected to PostgreSQL'))
    .catch(err => console.error('❌ DB Connection Error:', err.stack));

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
            await dbClient.query(query, values);
            
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
