import { useState, useEffect } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

const DashboardAdmin = ({ user }) => {
  const [theses, setTheses] = useState([])
  const [users, setUsers] = useState([])

  const fetchData = async () => {
    try {
      const [thesisRes, usersRes] = await Promise.all([
        axios.get('http://localhost:5000/api/thesis', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get('http://localhost:5000/api/auth/users', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      ])
      setTheses(thesisRes.data)
      setUsers(usersRes.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const stats = {
    totalTA: theses.length,
    mahasiswa: users.filter(u => u.role === 'mahasiswa').length,
    dosen: users.filter(u => u.role === 'dosen').length,
    lulus: theses.filter(t => t.status === 'lulus').length
  }

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
    }
    return statusMap[status] || status
  }

  return (
    <>
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Dashboard Administrator</h1>
            <p>Selamat datang, {user.name}!</p>
          </div>
          <Link to="/users" className="btn btn-primary">
            Manajemen Pengguna
          </Link>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Tugas Akhir</h3>
            <p>{stats.totalTA}</p>
          </div>
          <div className="stat-card">
            <h3>Mahasiswa</h3>
            <p>{stats.mahasiswa}</p>
          </div>
          <div className="stat-card">
            <h3>Dosen Pembimbing</h3>
            <p>{stats.dosen}</p>
          </div>
          <div className="stat-card" style={{ borderLeftColor: '#27ae60' }}>
            <h3>Telah Lulus</h3>
            <p style={{ color: '#27ae60' }}>{stats.lulus}</p>
          </div>
        </div>

        <div className="card">
          <h2>Tugas Akhir Terbaru</h2>
          {theses.length === 0 ? (
            <p>Belum ada tugas akhir yang diajukan.</p>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Judul</th>
                    <th>Mahasiswa</th>
                    <th>Pembimbing 1</th>
                    <th>Pembimbing 2</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {theses.slice(0, 5).map((thesis) => (
                    <tr key={thesis._id}>
                      <td>{thesis.judul}</td>
                      <td>{thesis.mahasiswa?.name || '-'}</td>
                      <td>{thesis.pembimbing1?.name || '-'}</td>
                      <td>{thesis.pembimbing2?.name || '-'}</td>
                      <td>
                        <span className={`status-badge status-${thesis.status === 'lulus' ? 'lulus' : 'bimbingan'}`}>
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
          {theses.length > 5 && (
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <Link to="/theses" className="btn btn-primary">
                Lihat Semua Tugas Akhir
              </Link>
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
  )
}

export default DashboardAdmin
