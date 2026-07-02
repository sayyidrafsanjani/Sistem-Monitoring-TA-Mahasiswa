const mongoose = require('mongoose');

const bimbinganSchema = new mongoose.Schema({
  thesis: { type: mongoose.Schema.Types.ObjectId, ref: 'Thesis', required: true },
  mahasiswa: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dosen: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tanggal: { type: Date, default: Date.now },
  catatan: { type: String }, // Catatan opsional (untuk bimbingan tatap muka bisa tidak diisi)
  file: { type: String }, // Nama file yang diupload
  status: { type: String, enum: ['pending', 'approved', 'revised'], default: 'pending' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Siapa yang membuat catatan
  jadwalBimbinganSelanjutnya: { type: Date } // Jadwal bimbingan selanjutnya
}, { timestamps: true });

module.exports = mongoose.model('Bimbingan', bimbinganSchema);
