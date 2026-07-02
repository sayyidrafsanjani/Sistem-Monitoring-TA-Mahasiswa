const express = require('express');
const Thesis = require('../models/Thesis');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all theses (admin sees all, dosen sees what they supervise, mahasiswa sees their own)
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'mahasiswa') {
      query.mahasiswa = req.user._id;
    } else if (req.user.role === 'dosen') {
      query = {
        $or: [
          { pembimbing1: req.user._id },
          { pembimbing2: req.user._id }
        ]
      };
    }
    const theses = await Thesis.find(query).populate('mahasiswa pembimbing1 pembimbing2').sort({ createdAt: -1 });
    res.json(theses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single thesis
router.get('/:id', protect, async (req, res) => {
  try {
    const thesis = await Thesis.findById(req.params.id).populate('mahasiswa pembimbing1 pembimbing2');
    if (!thesis) {
      return res.status(404).json({ message: 'Thesis not found' });
    }

    const canAccess =
      req.user.role === 'admin' ||
      (thesis.mahasiswa?._id ? thesis.mahasiswa._id.toString() : thesis.mahasiswa?.toString()) === req.user._id.toString() ||
      (thesis.pembimbing1?._id ? thesis.pembimbing1._id.toString() : thesis.pembimbing1?.toString()) === req.user._id.toString() ||
      (thesis.pembimbing2?._id ? thesis.pembimbing2._id.toString() : thesis.pembimbing2?.toString()) === req.user._id.toString();

    if (!canAccess) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(thesis);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create thesis (mahasiswa only)
router.post('/', protect, authorize('mahasiswa'), async (req, res) => {
  try {
    if (!req.body.pembimbing1) {
      return res.status(400).json({ message: 'Dosen pembimbing 1 wajib dipilih' });
    }

    if (!req.body.judul || req.body.judul.trim().length < 5) {
      return res.status(400).json({ message: 'Judul minimal 5 karakter' });
    }

    if (!req.body.abstrak || req.body.abstrak.trim().length < 20) {
      return res.status(400).json({ message: 'Abstrak minimal 20 karakter' });
    }

    const pembimbing1 = await User.findOne({ _id: req.body.pembimbing1, role: 'dosen' });
    if (!pembimbing1) {
      return res.status(400).json({ message: 'Pembimbing 1 harus dipilih dari akun dosen yang valid' });
    }

    const judulExists = await Thesis.findOne({ judul: req.body.judul.trim() });
    if (judulExists) {
      return res.status(400).json({ message: 'Judul tugas akhir sudah pernah diajukan' });
    }

    const thesis = new Thesis({
      judul: req.body.judul.trim(),
      abstrak: req.body.abstrak.trim(),
      pembimbing1: req.body.pembimbing1,
      mahasiswa: req.user._id
    });
    await thesis.save();
    await thesis.populate('mahasiswa pembimbing1 pembimbing2');
    res.status(201).json(thesis);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update thesis
router.put('/:id', protect, async (req, res) => {
  try {
    const thesis = await Thesis.findById(req.params.id);
    if (!thesis) {
      return res.status(404).json({ message: 'Thesis not found' });
    }

    // Only admin or owner mahasiswa can edit thesis data directly
    if (
      req.user.role !== 'admin' &&
      thesis.mahasiswa.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const updatedThesis = await Thesis.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('mahasiswa pembimbing1 pembimbing2');
    res.json(updatedThesis);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update thesis status
router.put('/:id/status', protect, async (req, res) => {
  try {
    const thesis = await Thesis.findById(req.params.id);
    if (!thesis) {
      return res.status(404).json({ message: 'Thesis not found' });
    }

    const isPembimbing1 = thesis.pembimbing1?.toString() === req.user._id.toString();
    const isPembimbing2 = thesis.pembimbing2?.toString() === req.user._id.toString();
    const isPembimbing = isPembimbing1 || isPembimbing2;

    // Alur perubahan status:
    // 1. pengajuan_judul -> penentuan_pembimbing_2: hanya oleh Pembimbing 1
    // 2. penentuan_pembimbing_2 -> proses_bimbingan: oleh Admin, harus menentukan Pembimbing 2
    // 3. Status selanjutnya: oleh Admin atau Pembimbing 1/2

    if (req.user.role === 'admin' || (req.user.role === 'dosen' && isPembimbing)) {
      // Validasi perubahan status dari pengajuan_judul
      if (thesis.status === 'pengajuan_judul' && req.body.status === 'penentuan_pembimbing_2') {
        if (!isPembimbing1) {
          return res.status(403).json({ message: 'Hanya Dosen Pembimbing 1 yang dapat memverifikasi judul' });
        }
      }

      // Validasi perubahan status dari penentuan_pembimbing_2
      if (thesis.status === 'penentuan_pembimbing_2' && req.body.status === 'proses_bimbingan') {
        if (req.user.role !== 'admin') {
          return res.status(403).json({ message: 'Hanya Admin yang dapat menentukan Pembimbing 2 dan memulai proses bimbingan' });
        }
        if (!thesis.pembimbing2 && !req.body.pembimbing2) {
          return res.status(400).json({ message: 'Pembimbing 2 harus ditentukan oleh Admin sebelum masuk ke proses bimbingan' });
        }
      }

      // Validasi pembimbing 2
      if (req.body.pembimbing2) {
        if (req.body.pembimbing2 === thesis.pembimbing1?.toString()) {
          return res.status(400).json({ message: 'Pembimbing 2 tidak boleh sama dengan pembimbing 1' });
        }

        const pembimbing2 = await User.findOne({ _id: req.body.pembimbing2, role: 'dosen' });
        if (!pembimbing2) {
          return res.status(400).json({ message: 'Pembimbing 2 harus dipilih dari akun dosen yang valid' });
        }
      }

      thesis.status = req.body.status;
      if (req.body.pembimbing2) {
        thesis.pembimbing2 = req.body.pembimbing2;
      }
      await thesis.save();
      await thesis.populate('mahasiswa pembimbing1 pembimbing2');
      res.json(thesis);
    } else {
      res.status(403).json({ message: 'Not authorized' });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete thesis
router.delete('/:id', protect, async (req, res) => {
  try {
    const thesis = await Thesis.findById(req.params.id);
    if (!thesis) {
      return res.status(404).json({ message: 'Thesis not found' });
    }

    if (req.user.role === 'admin') {
      await Thesis.findByIdAndDelete(req.params.id);
      return res.json({ message: 'Thesis deleted' });
    }

    const isOwner = thesis.mahasiswa.toString() === req.user._id.toString();
    if (req.user.role !== 'mahasiswa' || !isOwner) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (thesis.status !== 'pengajuan_judul') {
      return res.status(400).json({ message: 'Mahasiswa hanya dapat menghapus judul saat status masih pengajuan judul' });
    }

    await Thesis.findByIdAndDelete(req.params.id);
    res.json({ message: 'Thesis deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
