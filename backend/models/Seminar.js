const mongoose = require('mongoose');

const seminarSchema = new mongoose.Schema({
  thesis: { type: mongoose.Schema.Types.ObjectId, ref: 'Thesis', required: true },
  type: { 
    type: String, 
    enum: ['proposal', 'hasil', 'sidang_akhir', 'komprehensif'], 
    required: true 
  },
  tanggal: { type: Date },
  tempat: { type: String },
  penguji: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { 
    type: String, 
    enum: ['pengajuan', 'dijadwalkan', 'selesai', 'lulus', 'tidak_lulus'], 
    default: 'pengajuan' 
  },
  catatan: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Seminar', seminarSchema);
