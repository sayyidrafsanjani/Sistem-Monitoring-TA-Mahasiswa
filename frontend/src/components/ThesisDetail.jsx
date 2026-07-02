import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';

function ThesisDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [thesis, setThesis] = useState(null);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPembimbing2, setSelectedPembimbing2] = useState('');

  useEffect(() => {
    if (user) {
      fetchThesis();
      if (user.role === 'admin') {
        fetchUsers();
      }
    }
  }, [id, user]);

  // Update selectedStatus and selectedPembimbing2 when thesis data is loaded
  useEffect(() => {
    if (thesis) {
      setSelectedStatus(thesis.status);
      setSelectedPembimbing2(thesis.pembimbing2?._id || thesis.pembimbing2 || '');
    }
  }, [thesis]);

  const fetchThesis = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/thesis/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setThesis(res.data);
    } catch (err) {
      console.error(err);
      setMessage('Gagal memuat detail tugas akhir.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/auth/dosen', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      setMessage('Daftar dosen pembimbing gagal dimuat.');
    }
  };

  const updateStatus = async () => {
    try {
      await axios.put(`http://localhost:5000/api/thesis/${id}/status`, 
        { status: selectedStatus, pembimbing2: selectedPembimbing2 }, 
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setMessage('Status berhasil diperbarui!');
      fetchThesis();
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || 'Gagal memperbarui status!');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/thesis/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setShowDeleteModal(false);
      navigate('/theses');
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

  const allStatuses = [
    { key: 'pengajuan_judul', label: 'Pengajuan Judul' },
    { key: 'penentuan_pembimbing_2', label: 'Verifikasi Judul oleh Pembimbing 1' },
    { key: 'proses_bimbingan', label: 'Proses Bimbingan' },
    { key: 'upload_revisi', label: 'Upload Revisi' },
    { key: 'persetujuan_pembimbing', label: 'Persetujuan Pembimbing' },
    { key: 'pengajuan_seminar_proposal', label: 'Pengajuan Seminar Proposal' },
    { key: 'seminar_proposal', label: 'Seminar Proposal' },
    { key: 'perbaikan', label: 'Perbaikan' },
    { key: 'ujian_komprehensif', label: 'Ujian Komprehensif' },
    { key: 'pengajuan_seminar_hasil', label: 'Pengajuan Seminar Hasil' },
    { key: 'seminar_hasil', label: 'Seminar Hasil' },
    { key: 'pengajuan_sidang_akhir', label: 'Pengajuan Sidang Akhir' },
    { key: 'sidang_akhir', label: 'Sidang Akhir' },
    { key: 'lulus', label: 'Lulus' }
  ];

  const currentIndex = allStatuses.findIndex(s => s.key === thesis?.status);
  
  // Tentukan status yang dapat dipilih berdasarkan peran dan status saat ini
  const getSelectableStatuses = () => {
    if (user.role === 'admin') {
      return allStatuses;
    }
    
    if (user.role === 'dosen') {
      const isPembimbing1 = thesis?.pembimbing1?._id === user._id || thesis?.pembimbing1 === user._id;
      const isPembimbing2 = thesis?.pembimbing2?._id === user._id || thesis?.pembimbing2 === user._id;
      
      if (isPembimbing1 && thesis?.status === 'pengajuan_judul') {
        // Pembimbing 1 bisa memverifikasi judul ke status selanjutnya
        return allStatuses;
      } else if (isPembimbing1 || isPembimbing2) {
        // Pembimbing bisa mengubah status selain pengajuan_judul dan penentuan_pembimbing_2
        return allStatuses.filter((status) => !['pengajuan_judul'].includes(status.key));
      }
    }
    
    return [];
  };
  
  const selectableStatuses = getSelectableStatuses();

  if (loading) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h2>Memuat...</h2>
      </div>
    );
  }

  if (!thesis) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h2>Tugas Akhir tidak ditemukan</h2>
        <p><Link to="/theses">&larr; Kembali ke Daftar Tugas Akhir</Link></p>
      </div>
    );
  }

  return (
    <>
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Detail Tugas Akhir</h1>
            <p><Link to="/theses" style={{ color: 'var(--primary-color)' }}>&larr; Kembali ke Daftar</Link></p>
          </div>
          {(user.role === 'admin' || (user.role === 'mahasiswa' && thesis.status === 'pengajuan_judul')) && (
            <button type="button" className="btn btn-danger" onClick={() => setShowDeleteModal(true)}>
              Hapus Judul
            </button>
          )}
        </div>

        {message && (
          <div className={`alert ${message.includes('berhasil') ? 'alert-success' : 'alert-error'}`}>
            {message}
          </div>
        )}

        <div className="card">
          <div className="detail-item">
            <span className="detail-label">ID:</span>
            <span style={{ fontFamily: 'monospace', color: '#666' }}>{thesis._id}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Judul:</span>
            <span>{thesis.judul}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Abstrak:</span>
            <span>{thesis.abstrak || '-'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Mahasiswa:</span>
            <span>{thesis.mahasiswa?.name || '-'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Pembimbing 1:</span>
            <span>{thesis.pembimbing1?.name || '-'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Pembimbing 2:</span>
            <span>{thesis.pembimbing2?.name || '-'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Status:</span>
            <span className={`status-badge ${
              thesis.status === 'lulus' ? 'status-lulus' : 
              thesis.status.includes('bimbingan') ? 'status-bimbingan' : 
              'status-pengajuan'
            }`}>
              {getStatusText(thesis.status)}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Tanggal Pengajuan:</span>
            <span>{new Date(thesis.tanggalPengajuan).toLocaleDateString('id-ID', { 
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
            })}</span>
          </div>
        </div>

        {/* Status Update Section */}
        {(user.role === 'admin' || 
          (user.role === 'dosen' && (
            thesis.pembimbing1?._id === user._id || thesis.pembimbing2?._id === user._id ||
            thesis.pembimbing1 === user._id || thesis.pembimbing2 === user._id
          ))) && (
          <div className="card" style={{ marginTop: '20px' }}>
            <h2>Perbarui Status</h2>
            <div className="form-group">
              <label>Pilih Status Baru</label>
              <select 
                value={selectedStatus} 
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                {selectableStatuses.map((status) => (
                  <option key={status.key} value={status.key}>{status.label}</option>
                ))}
              </select>
            </div>
            {user.role === 'admin' && (
              <div className="form-group">
                <label>Tentukan Dosen Pembimbing 2</label>
                <select 
                  value={selectedPembimbing2}
                  onChange={(e) => setSelectedPembimbing2(e.target.value || null)}
                >
                  <option value="">-- Pilih Dosen Pembimbing 2 --</option>
                  {users.filter(u => u.role === 'dosen').map(dosen => (
                    <option
                      key={dosen._id}
                      value={dosen._id}
                      disabled={dosen._id === thesis.pembimbing1?._id || dosen._id === thesis.pembimbing1}
                    >
                      {dosen.name}{(dosen._id === thesis.pembimbing1?._id || dosen._id === thesis.pembimbing1) ? ' (Sudah jadi Pembimbing 1)' : ''}
                    </option>
                  ))}
                </select>
                <small>Dosen Pembimbing 1 memverifikasi judul terlebih dahulu, lalu Admin menentukan Dosen Pembimbing 2 dan memulai proses bimbingan.</small>
              </div>
            )}
            <div className="btn-group">
              <button type="button" className="btn btn-primary" onClick={updateStatus}>Perbarui Status</button>
            </div>
          </div>
        )}

        {/* Alur Proses Tugas Akhir */}
        <div className="card" style={{ marginTop: '20px' }}>
          <h2>Alur Proses Tugas Akhir</h2>
          <div className="workflow">
            {allStatuses.map((status, index) => (
              <div 
                key={status.key} 
                className={`workflow-step ${index < currentIndex ? 'completed' : ''} ${index === currentIndex ? 'active' : ''}`}
              >
                <div className="step-number">{index + 1}.</div>
                {status.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content confirm-modal">
            <h3>Konfirmasi Hapus Judul</h3>
            <p className="confirm-message">
              {user.role === 'admin'
                ? 'Judul tugas akhir ini akan dihapus permanen dari sistem.'
                : 'Anda hanya bisa menghapus judul milik sendiri saat status masih Pengajuan Judul.'}
            </p>
            <div className="confirm-summary">
              <strong>Judul:</strong> {thesis.judul}
            </div>
            <div className="btn-group">
              <button type="button" className="btn btn-danger" onClick={handleDelete}>
                Ya, Hapus
              </button>
              <button type="button" className="btn btn-primary" onClick={() => setShowDeleteModal(false)}>
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

export default ThesisDetail;
