import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function ThesisList({ user }) {
  const [theses, setTheses] = useState([]);
  const [dosenList, setDosenList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [newThesis, setNewThesis] = useState({ judul: '', abstrak: '', pembimbing1: '' });

  useEffect(() => {
    fetchTheses();
    if (user.role === 'mahasiswa' || user.role === 'admin') {
      fetchDosen();
    }
  }, [user]);

  const fetchTheses = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/thesis', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTheses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDosen = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/auth/dosen', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDosenList(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/thesis', newThesis, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMessage('Tugas Akhir berhasil diajukan!');
      setShowModal(false);
      setNewThesis({ judul: '', abstrak: '', pembimbing1: '' });
      fetchTheses();
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || 'Gagal mengajukan Tugas Akhir!');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/thesis/${deleteTarget._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMessage('Judul tugas akhir berhasil dihapus.');
      setDeleteTarget(null);
      fetchTheses();
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || 'Gagal menghapus judul tugas akhir.');
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'pengajuan_judul': 'Pengajuan Judul',
      'penentuan_pembimbing_2': 'Verifikasi Judul oleh Pembimbing 1',
      'proses_bimbingan': 'Proses Bimbingan',
      'upload_revisi': 'Upload Revisi',
      'persetujuan_pembimbing': 'Persetujuan Pembimbing',
      'pengajuan_seminar_proposal': 'Pengajuan Seminar Proposal',
      'seminar_proposal': 'Seminar Proposal',
      'perbaikan': 'Perbaikan',
      'ujian_komprehensif': 'Ujian Komprehensif',
      'pengajuan_seminar_hasil': 'Pengajuan Seminar Hasil',
      'seminar_hasil': 'Seminar Hasil',
      'pengajuan_sidang_akhir': 'Pengajuan Sidang Akhir',
      'sidang_akhir': 'Sidang Akhir',
      'lulus': 'Lulus'
    };
    return statusMap[status] || status;
  };

  const filteredTheses = theses.filter(thesis => 
    thesis.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
    thesis.mahasiswa?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    thesis._id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Daftar Tugas Akhir</h1>
            <p>Kelola semua Tugas Akhir</p>
          </div>
          {user.role === 'mahasiswa' && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              Ajukan Judul Baru
            </button>
          )}
        </div>

        {message && (
          <div className={`alert ${message.includes('berhasil') ? 'alert-success' : 'alert-error'}`}>
            {message}
          </div>
        )}

        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Cari judul, mahasiswa, atau ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Judul</th>
                  <th>Mahasiswa</th>
                  <th>Pembimbing 1</th>
                  <th>Pembimbing 2</th>
                  <th>Status</th>
                  <th>Tanggal Pengajuan</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredTheses.map(thesis => (
                  <tr key={thesis._id}>
                    <td><span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#666' }}>{thesis._id}</span></td>
                    <td>{thesis.judul}</td>
                    <td>{thesis.mahasiswa?.name || '-'}</td>
                    <td>{thesis.pembimbing1?.name || '-'}</td>
                    <td>{thesis.pembimbing2?.name || '-'}</td>
                    <td>
                      <span className={`status-badge ${
                        thesis.status === 'lulus' ? 'status-lulus' : 
                        thesis.status.includes('bimbingan') ? 'status-bimbingan' : 
                        'status-pengajuan'
                      }`}>
                        {getStatusText(thesis.status)}
                      </span>
                    </td>
                    <td>{new Date(thesis.tanggalPengajuan).toLocaleDateString('id-ID')}</td>
                    <td>
                      <Link to={`/theses/${thesis._id}`} className="btn btn-primary btn-sm">
                        Lihat Detail
                      </Link>
                      {(user.role === 'admin' || (user.role === 'mahasiswa' && thesis.status === 'pengajuan_judul')) && (
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          style={{ marginLeft: '8px' }}
                          onClick={() => setDeleteTarget(thesis)}
                        >
                          Hapus
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="dashboard-header" style={{ marginBottom: '20px' }}>
              <h2>Ajukan Tugas Akhir Baru</h2>
              <button type="button" className="btn btn-danger btn-sm" onClick={() => setShowModal(false)}>Tutup</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Judul Tugas Akhir <span style={{ color: 'red' }}>*</span></label>
                <input
                  type="text"
                  value={newThesis.judul}
                  onChange={(e) => setNewThesis({ ...newThesis, judul: e.target.value })}
                  placeholder="Masukkan judul"
                  required
                />
              </div>
              <div className="form-group">
                <label>Abstrak <span style={{ color: 'red' }}>*</span></label>
                <textarea
                  rows="4"
                  value={newThesis.abstrak}
                  onChange={(e) => setNewThesis({ ...newThesis, abstrak: e.target.value })}
                  placeholder="Masukkan abstrak minimal 20 karakter"
                  required
                />
              </div>
              <div className="form-group">
                <label>Dosen Pembimbing 1 <span style={{ color: 'red' }}>*</span></label>
                <select
                  value={newThesis.pembimbing1}
                  onChange={(e) => setNewThesis({ ...newThesis, pembimbing1: e.target.value })}
                  required
                >
                  <option value="">-- Pilih Dosen Pembimbing Akademik --</option>
                  {dosenList.map((dosen) => (
                    <option key={dosen._id} value={dosen._id}>{dosen.name}</option>
                  ))}
                </select>
                <small>Mahasiswa wajib memilih dosen pembimbing akademik sebagai pembimbing 1.</small>
              </div>
              <div className="btn-group">
                <button type="submit" className="btn btn-primary">Ajukan</button>
                <button type="button" className="btn btn-danger" onClick={() => setShowModal(false)}>Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="modal-overlay">
          <div className="modal-content confirm-modal">
            <h3>Konfirmasi Hapus Judul</h3>
            <p className="confirm-message">
              {user.role === 'admin'
                ? 'Judul tugas akhir ini akan dihapus permanen dari sistem.'
                : 'Anda hanya bisa menghapus judul milik sendiri saat status masih Pengajuan Judul.'}
            </p>
            <div className="confirm-summary">
              <strong>Judul:</strong> {deleteTarget.judul}
            </div>
            <div className="btn-group">
              <button type="button" className="btn btn-danger" onClick={handleDelete}>
                Ya, Hapus
              </button>
              <button type="button" className="btn btn-primary" onClick={() => setDeleteTarget(null)}>
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-grid">
            <div className="footer-section">
              <h4>Sistem Monitoring TA</h4>
              <p>Sistem informasi untuk pengelolaan tugas akhir mahasiswa secara terpadu dan efisien.</p>
            </div>
            <div className="footer-section">
              <h4>Link Cepat</h4>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/theses">Tugas Akhir</Link>
              <Link to="/bimbingan">Bimbingan</Link>
            </div>
            <div className="footer-section">
              <h4>Kontak</h4>
              <p>Email: support@example.com</p>
              <p>Telepon: (021) 1234567</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Sistem Monitoring Tugas Akhir. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}

export default ThesisList;
