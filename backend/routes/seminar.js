const express = require('express');
const Seminar = require('../models/Seminar');
const Thesis = require('../models/Thesis');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, authorize('mahasiswa', 'admin'), async (req, res) => {
  try {
    const thesis = await Thesis.findById(req.body.thesisId);
    if (!thesis) {
      return res.status(404).json({ message: 'Tugas akhir tidak ditemukan' });
    }

    if (req.user.role === 'mahasiswa' && thesis.mahasiswa.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Anda hanya bisa mengajukan seminar untuk tugas akhir Anda sendiri' });
    }

    const seminar = await Seminar.create({
      thesis: req.body.thesisId,
      type: req.body.type,
      tanggal: req.body.tanggal,
      tempat: req.body.tempat,
      penguji: req.body.penguji
    });
    await seminar.populate('thesis penguji');
    res.status(201).json(seminar);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    let query;
    if (req.user.role === 'mahasiswa') {
      const theses = await Thesis.find({ mahasiswa: req.user._id });
      const thesisIds = theses.map(t => t._id);
      query = Seminar.find({ thesis: { $in: thesisIds } });
    } else {
      query = Seminar.find();
    }
    const seminars = await query.populate('thesis penguji');
    res.json(seminars);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const seminar = await Seminar.findById(req.params.id).populate('thesis');
    if (!seminar) {
      return res.status(404).json({ message: 'Seminar tidak ditemukan' });
    }

    const canUpdate =
      req.user.role === 'admin' ||
      (req.user.role === 'mahasiswa' && seminar.thesis?.mahasiswa?.toString() === req.user._id.toString());

    if (!canUpdate) {
      return res.status(403).json({ message: 'Anda tidak berhak mengubah data seminar ini' });
    }

    Object.assign(seminar, req.body);
    await seminar.save();
    await seminar.populate('thesis penguji');
    res.json(seminar);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
