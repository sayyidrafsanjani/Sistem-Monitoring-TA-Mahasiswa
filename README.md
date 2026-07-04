# Sistem Monitoring Tugas Akhir

Aplikasi web full-stack untuk memantau proses bimbingan tugas akhir mahasiswa.

## Tech Stack
- **Backend**: Express.js, MongoDB (Mongoose), JWT, Multer
- **Frontend**: React, Vite, Axios, React Router
- **Database**: MongoDB Atlas (free tier)

## Fitur Utama
- Autentikasi & Otorisasi (Admin, Dosen, Mahasiswa)
- Manajemen Tugas Akhir
- Bimbingan dengan upload file dan status
- Notifikasi otomatis
- Filter & pencarian

---

## Panduan Hosting

### 1. Siapkan Database MongoDB Atlas
1. Buka [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Daftar / Login
3. Buat **Cluster Baru** (pilih free tier "M0 Sandbox")
4. Setelah cluster ready, klik **Connect** → **Connect your application**
5. Salin URL connection string (contoh):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/thesis-monitoring?retryWrites=true&w=majority
   ```
   Ganti `<username>` dan `<password>` dengan user database Anda!

### 2. Deploy Backend ke Render
1. Buat akun di [Render](https://render.com/)
2. Klik **New** → **Web Service**
3. Hubungkan repository GitHub Anda
4. Isi konfigurasi:
   - **Name**: `sistem-monitoring-ta-backend` (atau nama lain)
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Tambahkan **Environment Variables** di bagian **Environment**:
   - `MONGO_URI`: Isi dengan URL MongoDB Atlas Anda
   - `JWT_SECRET`: Isi dengan random string (contoh: `your_jwt_secret_key_here`)
6. Klik **Create Web Service** dan tunggu deploy selesai!
7. Salin URL backend Anda (contoh: `https://sistem-monitoring-ta-backend.onrender.com`)

### 3. Deploy Frontend ke Vercel
1. Buat akun di [Vercel](https://vercel.com/)
2. Klik **New Project**
3. Hubungkan repository GitHub Anda
4. Isi konfigurasi:
   - **Project Name**: `sistem-monitoring-ta` (atau nama lain)
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
5. Tambahkan **Environment Variables** di bagian **Environment Variables**:
   - `VITE_API_URL`: Isi dengan URL Render backend Anda (contoh: `https://sistem-monitoring-ta-backend.onrender.com`)
6. Klik **Deploy** dan tunggu selesai!
7. Salin URL frontend Anda (contoh: `https://sistem-monitoring-ta.vercel.app`)

### 4. Update CORS di Backend
Setelah frontend Anda selesai di-deploy, update file `backend/server.js` untuk menambahkan domain frontend ke `allowedOrigins`:
```javascript
const allowedOrigins = [
  'http://localhost:3000', 
  'http://localhost:3002',
  'https://sistem-monitoring-ta.vercel.app' // Ganti dengan domain Anda!
];
```
Commit dan push perubahan!

---

## Akun Default
- **Admin**: Username `jusjus`, Password `kacci123`

---

## Catatan Penting
- Upload file di Render mungkin tidak permanen (karena Render menggunakan ephemeral filesystem). Untuk upload permanen, gunakan layanan seperti AWS S3 atau Cloudinary!
- Untuk fitur notifikasi real-time, Anda bisa menambahkan Socket.io!

Selamat mencoba! 🚀
