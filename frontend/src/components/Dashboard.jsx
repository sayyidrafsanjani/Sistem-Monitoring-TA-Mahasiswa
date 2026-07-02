import { useState, useEffect } from 'react'
import axios from 'axios'

const Dashboard = ({ user }) => {
  const [theses, setTheses] = useState([])

  useEffect(() => {
    const fetchTheses = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/thesis', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        setTheses(res.data)
      } catch (err) {
        console.error(err)
      }
    }
    fetchTheses()
  }, [])

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
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Dashboard - {user.name}</h1>
      <div className="card">
        <h2>Daftar Tugas Akhir</h2>
        {theses.length === 0 ? (
          <p>Belum ada tugas akhir.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Judul</th>
                <th>Mahasiswa</th>
                <th>Pembimbing 1</th>
                <th>Pembimbing 2</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {theses.map((thesis) => (
                <tr key={thesis._id}>
                  <td>{thesis.judul}</td>
                  <td>{thesis.mahasiswa?.name}</td>
                  <td>{thesis.pembimbing1?.name || '-'}</td>
                  <td>{thesis.pembimbing2?.name || '-'}</td>
                  <td>
                    <span className="status-badge status-pengajuan">
                      {getStatusText(thesis.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default Dashboard
