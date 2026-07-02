const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Bimbingan = require('../models/Bimbingan');
const Thesis = require('../models/Thesis');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Setup folder uploads
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Konfigurasi multer untuk upload file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Buat nama file unik: timestamp + original name
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Filter file yang diizinkan
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt'];
  const extname = allowedTypes.includes(path.extname(file.originalname).toLowerCase());
  if (extname) {
    return cb(null, true);
  } else {
    cb(new Error('Hanya file PDF, DOC, DOCX, PPT, PPTX, dan TXT yang diizinkan!'));
  }
};

const upload = multer({ 
  storage: storage, 
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Batas 5MB
});

router.post('/', protect, upload.single('file'), async (req, res) => {
  try {
    const { thesisId, catatan, jadwalBimbinganSelanjutnya } = req.body;
    
    // Cek apakah thesis ada
    const thesis = await Thesis.findById(thesisId);
    if (!thesis) {
      return res.status(404).json({ message: 'Tugas Akhir tidak ditemukan' });
    }

    // Izinkan HANYA dosen pembimbing dan mahasiswa yang memiliki thesis ini (ADMIN TIDAK BOLEH)
    const isPembimbingDosen =
      thesis.pembimbing1?.toString() === req.user._id.toString() ||
      thesis.pembimbing2?.toString() === req.user._id.toString();
    const isOwner = thesis.mahasiswa.toString() === req.user._id.toString();

    if (!isPembimbingDosen && !isOwner) {
      return res.status(403).json({ message: 'Anda tidak memiliki izin untuk menambah bimbingan ini.' });
    }

    // Ambil mahasiswa dan dosen dari thesis
    const mahasiswaId = thesis.mahasiswa;
    let dosenId;
    if (req.user.role === 'dosen') {
      dosenId = req.user._id;
    } else {
      // Untuk mahasiswa, tetapkan dosenId ke pembimbing 1
      dosenId = thesis.pembimbing1;
    }

    const bimbinganData = {
      thesis: thesisId,
      mahasiswa: mahasiswaId,
      dosen: dosenId,
      catatan: catatan,
      createdBy: req.user._id, // Simpan siapa yang membuat catatan
      // Hanya dosen yang bisa mengatur jadwal
      jadwalBimbinganSelanjutnya: (req.user.role === 'dosen' && jadwalBimbinganSelanjutnya) ? new Date(jadwalBimbinganSelanjutnya) : undefined
    };

    // Jika ada file yang diupload
    if (req.file) {
      bimbinganData.file = req.file.filename;
    }

    const bimbingan = await Bimbingan.create(bimbinganData);
    
    // BUAT NOTIFIKASI
    let recipientId, message;
    if (req.user.role === 'dosen') {
      // Dosen buat bimbingan, kirim notif ke mahasiswa
      recipientId = mahasiswaId;
      message = `${req.user.name} menambahkan catatan bimbingan baru untuk tugas akhir "${thesis.judul}"`;
    } else {
      // Mahasiswa buat bimbingan/upload revisi, kirim notif ke pembimbing 1 dan 2 (jika ada)
      message = `${req.user.name} menambahkan revisi baru untuk tugas akhir "${thesis.judul}"`;
      
      // Kirim ke pembimbing 1
      await Notification.create({
        recipient: thesis.pembimbing1,
        sender: req.user._id,
        thesis: thesisId,
        bimbingan: bimbingan._id,
        message: message,
        type: 'bimbingan_new'
      });
      
      // Kirim ke pembimbing 2 jika ada
      if (thesis.pembimbing2) {
        await Notification.create({
          recipient: thesis.pembimbing2,
          sender: req.user._id,
          thesis: thesisId,
          bimbingan: bimbingan._id,
          message: message,
          type: 'bimbingan_new'
        });
      }
      
      await bimbingan.populate('mahasiswa dosen thesis');
      await bimbingan.populate('createdBy', 'name role');
      res.status(201).json(bimbingan);
      return;
    }
    
    // Buat notifikasi untuk mahasiswa
    await Notification.create({
      recipient: recipientId,
      sender: req.user._id,
      thesis: thesisId,
      bimbingan: bimbingan._id,
      message: message,
      type: 'bimbingan_new'
    });
    
    await bimbingan.populate('mahasiswa dosen thesis');
    await bimbingan.populate('createdBy', 'name role');
    res.status(201).json(bimbingan);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Terjadi kesalahan server' });
  }
});

// Route untuk menghapus bimbingan
router.delete('/:id', protect, async (req, res) => {
  try {
    const bimbingan = await Bimbingan.findById(req.params.id);
    if (!bimbingan) {
      return res.status(404).json({ message: 'Data bimbingan tidak ditemukan' });
    }

    // Izinkan admin dan dosen yang membuatnya untuk menghapus
    if (req.user.role !== 'admin' && bimbingan.dosen.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Anda tidak memiliki izin untuk menghapus bimbingan ini.' });
    }

    // Hapus file jika ada
    if (bimbingan.file) {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(__dirname, '../uploads', bimbingan.file);
      fs.unlink(filePath, (err) => {
        if (err) console.error('Gagal menghapus file:', err);
      });
    }

    await Bimbingan.findByIdAndDelete(req.params.id);
    res.json({ message: 'Riwayat bimbingan berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// Route untuk download file
router.get('/download/:filename', protect, (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../uploads', filename);
  
  res.download(filePath, filename, (err) => {
    if (err) {
      console.error(err);
      res.status(404).json({ message: 'File tidak ditemukan' });
    }
  });
});

router.get('/', protect, async (req, res) => {
  try {
    let bimbingans;
    
    if (req.user.role === 'mahasiswa') {
      // Mahasiswa melihat semua bimbingan miliknya
      bimbingans = await Bimbingan.find({ mahasiswa: req.user._id })
        .sort({ createdAt: -1 })
        .populate('mahasiswa dosen thesis')
        .populate('createdBy', 'name role');
    } else if (req.user.role === 'dosen') {
      // Dosen melihat semua bimbingan dimana dia adalah pembimbing 1 atau 2 di thesis terkait
      // Pertama, dapatkan semua thesis dimana dosen ini menjadi pembimbing 1 atau 2
      const theses = await Thesis.find({
        $or: [
          { pembimbing1: req.user._id },
          { pembimbing2: req.user._id }
        ]
      }).select('_id');
      
      const thesisIds = theses.map(t => t._id);
      
      // Kemudian cari semua bimbingan yang terkait dengan thesis tersebut
      bimbingans = await Bimbingan.find({ thesis: { $in: thesisIds } })
        .sort({ createdAt: -1 })
        .populate('mahasiswa dosen thesis')
        .populate('createdBy', 'name role');
    } else {
      // Admin melihat semua bimbingan
      bimbingans = await Bimbingan.find()
        .sort({ createdAt: -1 })
        .populate('mahasiswa dosen thesis')
        .populate('createdBy', 'name role');
    }
    
    res.json(bimbingans);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

router.put('/:id/status', protect, authorize('dosen'), async (req, res) => {
  try {
    const bimbingan = await Bimbingan.findById(req.params.id).populate('thesis');
    if (!bimbingan) {
      return res.status(404).json({ message: 'Data bimbingan tidak ditemukan' });
    }

    // Izinkan PA1 dan PA2 untuk update status
    const isPembimbing1 = bimbingan.thesis.pembimbing1?.toString() === req.user._id.toString() || 
                         bimbingan.thesis.pembimbing1 === req.user._id;
    const isPembimbing2 = bimbingan.thesis.pembimbing2?.toString() === req.user._id.toString() || 
                         bimbingan.thesis.pembimbing2 === req.user._id;

    if (!isPembimbing1 && !isPembimbing2) {
      return res.status(403).json({ message: 'Anda tidak berhak mengubah status bimbingan ini' });
    }

    bimbingan.status = req.body.status;
    await bimbingan.save();
    
    // Buat notifikasi ke mahasiswa ketika status diupdate
    await Notification.create({
      recipient: bimbingan.mahasiswa,
      sender: req.user._id,
      thesis: bimbingan.thesis,
      bimbingan: bimbingan._id,
      message: `${req.user.name} mengubah status bimbingan menjadi "${req.body.status === 'approved' ? 'Disetujui' : req.body.status === 'revised' ? 'Perlu Revisi' : 'Menunggu Persetujuan'}"`,
      type: 'bimbingan_status'
    });
    
    await bimbingan.populate('mahasiswa dosen thesis');
    res.json(bimbingan);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

module.exports = router;
