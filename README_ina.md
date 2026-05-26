# Local GitOps Engine: Zero-Cost Enterprise CI/CD Simulation

Infrastruktur DevOps tingkat produksi (*production-grade*) lokal yang mereplikasi alur kerja GitOps perusahaan besar di dalam satu mesin. Proyek ini mendemonstrasikan cara membangun *pipeline* penyebaran (*deployment*) otomatis yang aman dan tanpa *downtime* (*zero-downtime*) untuk microservice GPS Tracking tanpa memakan biaya penyedia cloud, memanfaatkan **WSL2**, **Docker**, **Nginx**, dan **GitHub Actions (`act`)**.

---

## 🏗️ Gambaran Arsitektur

Arsitektur sistem dibagi menjadi dua lingkungan terisolasi yang meniru penerapan Cloud di dunia nyata:
1. **Node Developer/Runner (WSL2 Ubuntu):** Bertindak sebagai mesin Developer sekaligus CI/CD Runner yang mengeksekusi pipeline otomatis lokal melalui `act`.
2. **Host Produksi/Staging (Windows/Docker Desktop):** Bertindak sebagai Virtual Private Server (VPS) Live terisolasi tempat layanan dideploy secara aman.



[ Developer / WSL2 Ubuntu ]
                          │
                 git push / act push
                          ▼
       ┌──────────────────────────────────────┐
       │    Pipeline CI/CD Lokal (`act`)      │
       ├──────────────────────────────────────┤
       │ 1. Validasi Sintaks Kode (Linting)   │
       │ 2. Sinkronisasi Artefak              │
       │ 3. Orkestrasi Kontainer Pintar       │
       └──────────────────┬───────────────────┘
                          │ (Deploy Otomatis)
                          ▼
    ┌────────────────────────────────────────────┐
    │       Host Produksi Terisolasi (Docker)    │
    │                                            │
    │  ┌───────────────┐     ┌────────────────┐  │
    │  │  Nginx Proxy  │────>│  Node.js App   │  │
    │  │ (HTTPS Lokal) │     │ (Smart Rebuild)│  │
    │  └───────────────┘     └───────┬────────┘  │
    │                                │           │
    │                                ▼           │
    │                        ┌────────────────┐  │
    │                        │ PostgreSQL DB  │  │
    │                        └────────────────└  │
    └────────────────────────────────────────────┘

### Fitur Teknis Utama:
* **Reverse Proxy & Pengerasan SSL/TLS:** Dikelola oleh Nginx dengan sertifikat lokal tepercaya melalui `mkcert` (`https://gps-tracking.local`).
* **Integrasi DevSecOps:** Validasi sintaks kode statis sebagai gerbang pengaman sebelum melakukan perubahan pada server produksi.
* **Konfigurasi Twelve-Factor App:** Memisahkan kredensial database dari kode utama menggunakan variabel lingkungan (*environment variables*) `.env` yang terisolasi.
* **Zero-Downtime Deployment:** Mekanisme *rolling-update* yang memastikan aplikasi tetap aktif (*high availability*) selama proses pembaruan server.

---

## 🛠️ Tech Stack & Alat

* **Orchestration & Containerization:** Docker, Docker Compose
* **CI/CD / GitOps Automation:** GitHub Actions, `act` (Local Workflow Engine)
* **Web Server & Security:** Nginx, `mkcert` (Local CA/TLS)
* **Backend & Database:** Node.js (WebSockets), PostgreSQL 15
* **Environment:** WSL2 (Ubuntu 22.04 LTS), Windows 11

---

## 🚀 Alur Pipeline GitOps (`deploy.yml`)

Proses *deployment* berjalan sepenuhnya otomatis dan deklaratif. Saat dipicu, pipeline akan mengeksekusi langkah-langkah atomik berikut:

1. **Checkout:** Mengambil kode terbaru dari repositori pengembangan.
2. **Code Guard (CI):** Memvalidasi sintaks Node.js untuk mencegah kode yang rusak atau eror masuk ke lingkungan staging live.
3. **Artifact Sync:** Menyalin aset produksi yang telah divalidasi ke direktori aplikasi host yang terisolasi (`/opt/apps/`).
4. **Smart Restart (CD):** Membangun ulang (*rebuild*) dan mengganti kontainer microservice backend secara instan menggunakan flag isolasi kontainer.

---

## 💡 Sorotan Teknis & Penyelesaian Masalah

Selama pengembangan infrastruktur ini, beberapa tantangan tingkat perusahaan berhasil diidentifikasi dan diatasi:

### 1. Mencapai Zero-Downtime Deployment (Solusi Eror 502 Bad Gateway)
* **Tantangan:** Metode deployment tradisional seperti `docker compose down && docker compose up` menyebabkan gangguan layanan (*downtime*), yang sangat dihindari di lingkungan produksi.
* **Solusi:** Mengubah langkah CD untuk menargetkan microservice backend secara spesifik menggunakan flag `--no-deps` dan `--build`:
  ```bash
  docker compose up -d --no-deps --build backend-service




====================================================================================================================================

Hal ini memaksa Docker membangun image baru di latar belakang (background) dan langsung mengganti kontainer aplikasi dalam hitungan milidetik, tanpa mengganggu Nginx maupun Database—mencapai ketersediaan layanan yang mulus (high availability).

2. Eliminating Secrets Leakage (Kepatuhan Prinsip Twelve-Factor App)
Tantangan: Menulis kredensial database (POSTGRES_PASSWORD) secara mentah (hardcoded) di dalam kode atau file docker-compose.yml adalah celah keamanan fatal dan melanggar audit kepatuhan.

Solusi: Memisahkan semua kredensial sensitif ke dalam file lokal .env yang aman. Mendaftarkan file .env ke dalam .gitignore untuk menjamin keamanan mutlak dari kebocoran repositori publik, sembari menggunakan pemanggilan variabel dinamis (${DB_PASSWORD}) di seluruh infrastruktur.

3. Mengatasi Konflik Runner (Docker-in-Docker Duplicate Mounts)
Tantangan: Menjalankan act dengan flag --bind saat mendeklarasikan volume Docker socket secara eksplisit di deploy.yml menyebabkan eror daemon berupa Duplicate mount point.

Solusi: Memisahkan variabel lingkungan, memanfaatkan fitur background socket sharing bawaan dari act, serta mengoptimalkan konfigurasi YAML agar memiliki kesamaan fungsi dengan Cloud upstream tanpa merusak kompatibilitas.

⚙️ Cara Menjalankan Secara Lokal
Prasyarat
WSL2 Ubuntu sudah terinstal.

Docker Desktop dengan integrasi WSL2 aktif.

act CLI terinstal di WSL2.

mkcert terkonfigurasi di mesin host (Windows).

Setup Lingkungan
Buat file .env di root direktori proyek:

Ini, TOML
DB_USER=admin
DB_HOST=db-gps
DB_NAME=gps_tracking
DB_PASSWORD=password_aman_pilihanmu_disini
DB_PORT=5432
Eksekusi
Untuk mensimulasikan seluruh alur kerja pipeline multi-stage secara lokal, jalankan perintah berikut di direktori proyek kamu:

Bash
act push
Untuk memverifikasi kemampuan Zero-Downtime, jalankan simulator GPS secara bersamaan saat pipeline sedang dieksekusi:

Bash
docker exec -it gps_backend node client.js
Koneksi client akan tetap terhubung secara mulus bahkan ketika kontainer aplikasi di bawahnya sedang berganti otomatis ke versi terbaru.

📄 Author: Aradea - DevOps / Platform Engineer Enthusiast
