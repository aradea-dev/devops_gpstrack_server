#!/bin/bash

# 1. Suruh act jalan duluan buat ngetes sintaks & copy file terbaru ke /opt/apps
echo "🚀 Memulai Validasi & Sinkronisasi Kode via 'act'..."
act push

# 2. Pindah ke folder live tempat docker-compose berada
cd /opt/apps/devops_gpstrack_server

# 3. Cek status Nginx di laptop Anda, bukan di dalam act!
echo "🧐 Memeriksa status infrastruktur nyata di laptop..."
NGINX_STATUS=$(docker ps -q -f name=gps_nginx)

if [ -z "$NGINX_STATUS" ]; then
  echo "⚠️ Deteksi: Docker sedang mati semua!"
  echo "🚀 Menjalankan COLD-START (DB, Backend, Nginx dinyalakan dari nol)..."
  docker compose up -d --build
  
  docker image prune -f
  echo "✅ Cold-Start Sukses! Semua kontainer aktif."
else
  echo "🔄 Deteksi: Nginx sedang aktif melayani user."
  echo "⚡ Memulai SMART RESTART (Hot-Swap) HANYA pada Backend..."
  docker compose up -d --no-deps --build backend-service
  
  docker image prune -f
  echo "✅ Zero-Downtime Deployment Sukses!"
fi
