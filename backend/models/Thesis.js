const mongoose = require('mongoose');

const thesisSchema = new mongoose.Schema({
  mahasiswa: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  judul: { type: String, required: true },
  abstrak: { type: String },
  status: { 
    type: String, 
    enum: [
      'pengajuan_judul',
      'penentuan_pembimbing_2',
      'proses_bimbingan',
      'upload_revisi',
      'persetujuan_pembimbing',
      'pengajuan_seminar_proposal',
      'seminar_proposal',
      'perbaikan',
      'ujian_komprehensif',
      'pengajuan_seminar_hasil',
      'seminar_hasil',
      'pengajuan_sidang_akhir',
      'sidang_akhir',
      'lulus'
    ], 
    default: 'pengajuan_judul' 
  },
  pembimbing1: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pembimbing2: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  file: { type: String },
  tanggalPengajuan: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Thesis', thesisSchema);
