# Sistem Monitoring Tugas Akhir Mahasiswa

Aplikasi web untuk monitoring proses tugas akhir mahasiswa dari pengajuan judul sampai lulus.

## Teknologi yang Digunakan

- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT
- **Frontend**: React.js, React Router, Axios, Vite

## Alur Proses Tugas Akhir

1. Mahasiswa Login
2. Pengajuan Judul
3. Admin Memverifikasi
4. Penentuan Dosen Pembimbing
5. Proses Bimbingan
6. Upload Revisi
7. Persetujuan Pembimbing
8. Pengajuan Seminar Proposal
9. Seminar Proposal
10. Perbaikan
11. Ujian Komprehensif
12. Pengajuan Seminar Hasil
13. Seminar Hasil
14. Pengajuan Sidang Akhir
15. Sidang Akhir
16. Lulus

## Cara Menjalankan Aplikasi

### Prasyarat

- Node.js (versi 14 atau lebih baru)
- MongoDB (running di localhost:27017)

### Langkah-langkah

1. **Install Dependencies Backend**
   ```bash
   cd backend
   npm install
   ```

2. **Install Dependencies Frontend**
   ```bash
   cd frontend
   npm install
   ```

3. **Jalankan MongoDB**
   Pastikan MongoDB berjalan di localhost:27017

4. **Jalankan Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   Backend akan berjalan di http://localhost:5000

5. **Jalankan Frontend**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend akan berjalan di http://localhost:3000

## Fitur Aplikasi

- **Autentikasi**: Login dan Register untuk Mahasiswa, Dosen, dan Admin
- **Manajemen Tugas Akhir**: Pengajuan judul, update status, assign dosen pembimbing
- **Bimbingan**: Catatan bimbingan antara mahasiswa dan dosen
- **Seminar**: Manajemen seminar proposal, seminar hasil, ujian komprehensif, dan sidang akhir
- **Dashboard**: Overview status tugas akhir untuk setiap role

## Role Pengguna

1. **Mahasiswa**: Mengajukan judul, melihat status, melihat bimbingan, mengajukan seminar
2. **Dosen**: Melihat bimbingan, memberikan feedback, approve/revisi
3. **Admin**: Verifikasi judul, assign dosen pembimbing, mengelola semua data
