# 1. Gunakan base image Node.js versi LTS yang ringan
FROM node:20-alpine

# 2. Tentukan folder kerja di dalam container
WORKDIR /app

# 3. Copy file package.json dan package-lock.json terlebih dahulu
COPY package*.json ./

# 4. Install dependencies (hanya production agar ukuran container kecil)
RUN npm install --only=production

# 5. Copy seluruh sisa kode backend (server.js, dll) ke dalam container
COPY . .

# 6. Buka port 3000 sesuai dengan port yang dipakai server.js
EXPOSE 3000

# 7. Perintah untuk menjalankan backend Anda
CMD ["node", "server.js"]
