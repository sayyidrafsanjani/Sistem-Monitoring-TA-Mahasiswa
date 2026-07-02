import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const DashboardDosen = ({ user }) => {
  const [theses, setTheses] = useState([]);
  const [bimbingans, setBimbingans] = useState([]);

  const fetchData = async () => {
    try {
      const thesisRes = await axios.get('http://localhost:5000/api/thesis', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      const filteredTheses = thesisRes.data.filter(
        (t) =>
          t.pembimbing1?._id === user._id ||
          t.pembimbing2?._id === user._id ||
          t.pembimbing1 === user._id ||
          t.pembimbing2 === user._id
      );
      setTheses(filteredTheses);

      const bimbinganRes = await axios.get('http://localhost:5000/api/bimbingan', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setBimbingans(bimbinganRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

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

  return (
    <>
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Dashboard Dosen</h1>
            <p>Selamat datang, {user.name}!</p>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Tugas Akhir Dibimbing</h3>
            <p>{theses.length}</p>
          </div>
          <div className="stat-card">
            <h3>Jumlah Bimbingan</h3>
            <p>{bimbingans.length}</p>
          </div>
        </div>

        <div className="card">
          <h2>Tugas Akhir yang Dibimbing</h2>
          {theses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>Belum ada tugas akhir yang dibimbing.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Judul</th>
                    <th>Mahasiswa</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {theses.map((thesis) => (
                    <tr key={thesis._id}>
                      <td>{thesis.judul}</td>
                      <td>{thesis.mahasiswa?.name || '-'}</td>
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
                    <th>Mahasiswa</th>
                    <th>Tanggal</th>
                    <th>Catatan</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bimbingans.map((bimbingan) => (
                    <tr key={bimbingan._id}>
                      <td>{bimbingan.thesis?.judul || '-'}</td>
                      <td>{bimbingan.mahasiswa?.name || '-'}</td>
                      <td>{new Date(bimbingan.tanggal).toLocaleDateString('id-ID', {
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                      })}</td>
                      <td>{bimbingan.catatan}</td>
                      <td>
                        <span className={`status-badge ${bimbingan.status === 'approved' ? 'status-selesai' : 'status-bimbingan'}`}>
                          {bimbingan.status === 'approved' ? 'Disetujui' : bimbingan.status === 'revised' ? 'Perlu Revisi' : 'Pending'}
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

export default DashboardDosen;
