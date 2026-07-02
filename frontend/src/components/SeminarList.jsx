import { useState, useEffect } from 'react'
import axios from 'axios'

const SeminarList = ({ user }) => {
  const [seminars, setSeminars] = useState([])

  useEffect(() => {
    const fetchSeminars = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/seminar', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        setSeminars(res.data)
      } catch (err) {
        console.error(err)
      }
    }
    fetchSeminars()
  }, [])

  const getTypeText = (type) => {
    const typeMap = {
      'proposal': 'Seminar Proposal',
      'hasil': 'Seminar Hasil',
      'sidang_akhir': 'Sidang Akhir',
      'komprehensif': 'Ujian Komprehensif'
    }
    return typeMap[type] || type
  }

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Daftar Seminar</h1>
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Jenis</th>
              <th>Tugas Akhir</th>
              <th>Tanggal</th>
              <th>Tempat</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {seminars.map((seminar) => (
              <tr key={seminar._id}>
                <td>{getTypeText(seminar.type)}</td>
                <td>{seminar.thesis?.judul}</td>
                <td>{seminar.tanggal ? new Date(seminar.tanggal).toLocaleDateString() : '-'}</td>
                <td>{seminar.tempat || '-'}</td>
                <td>
                  <span className={`status-badge ${seminar.status === 'lulus' ? 'status-selesai' : 'status-pengajuan'}`}>
                    {seminar.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default SeminarList
