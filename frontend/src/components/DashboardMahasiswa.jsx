import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../utils/api';

const DashboardMahasiswa = ({ user }) => {
  const [theses, setTheses] = useState([]);
  const [bimbingans, setBimbingans] = useState([]);

  const fetchData = async () => {
    try {
      // Fetch tugas akhir milik mahasiswa ini
      const thesisRes = await axios.get(`${API_BASE_URL}/api/thesis`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTheses(thesisRes.data);

      // Fetch bimbingan
      const bimbinganRes = await axios.get(`${API_BASE_URL}/api/bimbingan`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setBimbingans(bimbinganRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  const getNextStep = (thesis) => {
    switch (thesis.status) {
      case 'pengajuan_judul':
        return 'Menunggu verifikasi judul dari Pembimbing 1';
      case 'penentuan_pembimbing_2':
        return 'Menunggu admin menentukan Pembimbing 2';
      case 'proses_bimbingan':
        return 'Lakukan bimbingan dengan dosen pembimbing dan upload revisi jika diperlukan';
      case 'lulus':
        return 'Selamat! Anda telah lulus sidang akhir';
      default:
        return 'Lanjutkan proses sesuai alur tugas akhir';
    }
  };

  return (
    <>
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Dashboard Mahasiswa</h1>
            <p>Selamat datang, {user.name}!</p>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Jumlah Tugas Akhir</h3>
            <p>{theses.length}</p>
          </div>
          <div className="stat-card">
            <h3>Riwayat Bimbingan</h3>
            <p>{bimbingans.length}</p>
          </div>
        </div>

        {/* Langkah Selanjutnya */}
        {theses.length > 0 && (
          <div className="card">
            <h2>Langkah Selanjutnya</h2>
            {theses.map((thesis) => (
              <div 
                key={thesis._id} 
                style={{ 
                  border: '1px solid #e0e0e0', 
                  borderRadius: '8px', 
                  padding: '16px', 
                  marginBottom: '16px', 
                  background: '#f8f9fa' 
                }}
              >
                <h4 style={{ marginBottom: '8px' }}>{thesis.judul}</h4>
                <p style={{ margin: '0', color: '#0a4c7c', fontWeight: '500' }}>
                  📌 {getNextStep(thesis)}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="card">
          <h2>Tugas Akhir Saya</h2>
          {theses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>Belum ada tugas akhir. Silakan ajukan judul baru!</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Judul</th>
                    <th>Pembimbing 1</th>
                    <th>Pembimbing 2</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {theses.map((thesis) => (
                    <tr key={thesis._id}>
                      <td>{thesis.judul}</td>
                      <td>{thesis.pembimbing1?.name || '-'}</td>
                      <td>{thesis.pembimbing2?.name || '-'}</td>
                      <td>
                        <span className={`status-badge ${thesis.status === 'lulus' ? 'status-lulus' : 'status-bimbingan'}`}>
                          {getStatusText(thesis.status)}
                        </span>
                      </td>
                      <td>
                        <Link to={`/theses/${thesis._id}`} className="btn btn-primary btn-sm">
                          Lihat Detail
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div style={{ marginTop: '1rem' }}>
            <Link to="/theses" className="btn btn-success">Ajukan Judul Baru</Link>
          </div>
        </div>

        <div className="card">
          <h2>Riwayat Bimbingan</h2>
          {bimbingans.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>Belum ada riwayat bimbingan.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Tugas Akhir</th>
                    <th>Tanggal</th>
                    <th>Catatan</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bimbingans.map((bimbingan) => (
                    <tr key={bimbingan._id}>
                      <td>{bimbingan.thesis?.judul || '-'}</td>
                      <td>{new Date(bimbingan.tanggal).toLocaleDateString('id-ID', { 
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                      })}</td>
                      <td>{bimbingan.catatan}</td>
                      <td>
                        <span className={`status-badge ${bimbingan.status === 'approved' ? 'status-selesai' : 'status-bimbingan'}`}>
                          {bimbingan.status === 'approved' ? 'Disetujui' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

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
};

export default DashboardMahasiswa;
