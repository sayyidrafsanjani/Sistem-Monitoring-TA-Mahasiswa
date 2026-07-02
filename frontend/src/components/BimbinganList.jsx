import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useNotifications } from '../context/NotificationContext';

const BimbinganList = ({ user }) => {
  const { fetchNotifications } = useNotifications();
  const [bimbingans, setBimbingans] = useState([]);
  const [filteredBimbingans, setFilteredBimbingans] = useState([]);
  const [theses, setTheses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedThesis, setSelectedThesis] = useState('');
  const [selectedThesisFilter, setSelectedThesisFilter] = useState('');
  const [catatan, setCatatan] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [jadwalBimbinganSelanjutnya, setJadwalBimbinganSelanjutnya] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');

  const getStatusText = (status) => {
    const statusMap = {
      pending: 'Menunggu Persetujuan',
      approved: 'Disetujui',
      revised: 'Perlu Revisi'
    };
    return statusMap[status] || status;
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'approved': return 'status-lulus';
      case 'revised': return 'status-bimbingan';
      default: return 'status-pengajuan';
    }
  };

  const handleUpdateStatus = async (bimbinganId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/bimbingan/${bimbinganId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setMessage('Status bimbingan berhasil diperbarui!');
      fetchData();
    } catch (err) {
      console.error(err);
      setMessage('Gagal memperbarui status bimbingan.');
    }
  };

  const handleDelete = async (bimbinganId) => {
    if (!window.confirm('Anda yakin ingin menghapus riwayat bimbingan ini?')) {
      return;
    }
    try {
      await axios.delete(`http://localhost:5000/api/bimbingan/${bimbinganId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMessage('Riwayat bimbingan berhasil dihapus!');
      fetchData();
    } catch (err) {
      console.error(err);
      setMessage('Gagal menghapus riwayat bimbingan.');
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const fetchData = async () => {
    try {
      const [bimbinganRes, thesisRes] = await Promise.all([
        axios.get('http://localhost:5000/api/bimbingan', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get('http://localhost:5000/api/thesis', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      ]);
      
      // Filter thesis sesuai role
      let filteredTheses = thesisRes.data;
      if (user.role === 'dosen') {
        filteredTheses = thesisRes.data.filter(
          (t) =>
            t.pembimbing1?._id === user._id ||
            t.pembimbing2?._id === user._id ||
            t.pembimbing1 === user._id ||
            t.pembimbing2 === user._id
        );
      } else if (user.role === 'mahasiswa') {
        filteredTheses = thesisRes.data.filter(
          (t) => t.mahasiswa?._id === user._id || t.mahasiswa === user._id
        );
      }
      
      setBimbingans(bimbinganRes.data);
      setFilteredBimbingans(bimbinganRes.data);
      setTheses(filteredTheses);
    } catch (err) {
      console.error(err);
    }
  };

  // Filter bimbingan berdasarkan search term dan thesis filter
  useEffect(() => {
    let filtered = bimbingans;
    
    // Filter by thesis
    if (selectedThesisFilter) {
      filtered = filtered.filter(bimbingan => bimbingan.thesis?._id === selectedThesisFilter || bimbingan.thesis === selectedThesisFilter);
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(bimbingan => {
        const thesisJudul = bimbingan.thesis?.judul?.toLowerCase() || '';
        const mahasiswaName = bimbingan.mahasiswa?.name?.toLowerCase() || '';
        const dosenName = bimbingan.dosen?.name?.toLowerCase() || '';
        const catatanText = bimbingan.catatan?.toLowerCase() || '';
        
        return thesisJudul.includes(searchTerm.toLowerCase()) ||
               mahasiswaName.includes(searchTerm.toLowerCase()) ||
               dosenName.includes(searchTerm.toLowerCase()) ||
               catatanText.includes(searchTerm.toLowerCase());
      });
    }
    
    setFilteredBimbingans(filtered);
  }, [searchTerm, bimbingans, selectedThesisFilter]);

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedThesis) {
      setMessage('Pilih Tugas Akhir terlebih dahulu!');
      return;
    }
    if (!catatan && !selectedFile) {
      setMessage('Isi catatan atau upload file (minimal satu)!');
      return;
    }
    
    try {
      // Gunakan FormData untuk mengirim file
      const formData = new FormData();
      formData.append('thesisId', selectedThesis);
      formData.append('catatan', catatan);
      formData.append('jadwalBimbinganSelanjutnya', jadwalBimbinganSelanjutnya);
      if (selectedFile) {
        formData.append('file', selectedFile);
      }
      
      await axios.post('http://localhost:5000/api/bimbingan',
        formData,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setMessage('Catatan bimbingan berhasil ditambahkan!');
      setShowForm(false);
      setSelectedThesis('');
      setCatatan('');
      setSelectedFile(null);
      setJadwalBimbinganSelanjutnya('');
      fetchData();
      fetchNotifications();
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || 'Gagal menambahkan catatan bimbingan. Silakan coba lagi.');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Riwayat Bimbingan</h1>
            <p>{user.role === 'dosen' ? 'Catatan bimbingan untuk mahasiswa bimbingan Anda' : 'Riwayat bimbingan tugas akhir Anda'}</p>
          </div>
          {user.role !== 'admin' && (
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Batal' : 'Tambah Catatan / Upload File'}
            </button>
          )}
        </div>

        {message && (
          <div className={`alert ${message.includes('berhasil') ? 'alert-success' : 'alert-error'}`}>
            {message}
          </div>
        )}

        {/* Search & Filter Bar */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="Cari riwayat bimbingan berdasarkan judul, nama, atau catatan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1, minWidth: '250px', padding: '10px 16px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem' }}
          />
          {theses.length > 0 && (
            <select
              value={selectedThesisFilter}
              onChange={(e) => setSelectedThesisFilter(e.target.value)}
              style={{ padding: '10px 16px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem', minWidth: '200px' }}
            >
              <option value="">-- Semua Tugas Akhir --</option>
              {theses.map((thesis) => (
                <option key={thesis._id} value={thesis._id}>
                  {thesis.judul}
                </option>
              ))}
            </select>
          )}
        </div>

        {showForm && user.role !== 'admin' && (
          <div className="card">
            <h2>{user.role === 'mahasiswa' ? 'Upload Revisi / Tambah Catatan' : 'Tambah Catatan Bimbingan / Upload File'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Pilih Tugas Akhir <span style={{ color: 'red' }}>*</span></label>
                <select
                  value={selectedThesis}
                  onChange={(e) => setSelectedThesis(e.target.value)}
                  required
                >
                  <option value="">-- Pilih Tugas Akhir --</option>
                  {theses.map((thesis) => (
                    <option key={thesis._id} value={thesis._id}>
                      {thesis.judul} - {user.role === 'mahasiswa' ? '' : (thesis.mahasiswa?.name || 'Mahasiswa')}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Catatan Bimbingan <span style={{ color: '#666' }}>(Opsional)</span></label>
                <textarea
                  rows="5"
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder={user.role === 'mahasiswa' 
                    ? 'Masukkan catatan tentang revisi yang telah dikerjakan (opsional)...' 
                    : 'Masukkan catatan bimbingan (opsional)...'}
                />
              </div>
              <div className="form-group">
                <label>
                  {user.role === 'mahasiswa' ? 'Upload File Revisi ' : 'Upload File '}
                  <span style={{ color: '#666' }}>(Opsional - PDF/DOC/DOCX/PPT/PPTX/TXT (Max 5MB))</span>
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                />
                {selectedFile && <small style={{ display: 'block', marginTop: '5px' }}>File dipilih: {selectedFile.name}</small>}
              </div>
              {user.role === 'dosen' && (
                <div className="form-group">
                  <label>Jadwal Bimbingan Selanjutnya <span style={{ color: '#666' }}>(Opsional)</span></label>
                  <input
                    type="datetime-local"
                    value={jadwalBimbinganSelanjutnya}
                    onChange={(e) => setJadwalBimbinganSelanjutnya(e.target.value)}
                  />
                </div>
              )}
              <div className="btn-group">
                <button type="submit" className="btn btn-primary">Simpan</button>
                <button type="button" className="btn btn-danger" onClick={() => {
                  setShowForm(false);
                  setSelectedThesis('');
                  setCatatan('');
                  setSelectedFile(null);
                  setJadwalBimbinganSelanjutnya('');
                  setMessage('');
                }}>Batal</button>
              </div>
            </form>
          </div>
        )}

        <div className="card">
          {filteredBimbingans.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <h3>Belum Ada Riwayat Bimbingan</h3>
              <p>{user.role === 'dosen' ? 'Anda belum menambahkan catatan bimbingan untuk mahasiswa.' : 'Anda belum memiliki riwayat bimbingan.'}</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Tanggal & Waktu</th>
                    {user.role !== 'mahasiswa' && <th>Mahasiswa</th>}
                    {user.role !== 'dosen' && <th>Dosen Pembimbing</th>}
                    <th>Tugas Akhir</th>
                    <th>Dibuat Oleh</th>
                    <th>Catatan</th>
                    <th>File</th>
                    <th>Jadwal Selanjutnya</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBimbingans.map((bimbingan) => (
                    <tr key={bimbingan._id}>
                      <td>{formatDate(bimbingan.createdAt || bimbingan.tanggal)}</td>
                      {user.role !== 'mahasiswa' && <td>{bimbingan.mahasiswa?.name || '-'}</td>}
                      {user.role !== 'dosen' && <td>{bimbingan.dosen?.name || '-'}</td>}
                      <td>{bimbingan.thesis?.judul || '-'}</td>
                      <td>
                        {bimbingan.createdBy?.name || '-'}
                        <br />
                        <span className={`status-badge ${
                          bimbingan.createdBy?.role === 'dosen' ? 'status-pengajuan' : 'status-bimbingan'
                        }`} style={{ fontSize: '0.75rem', padding: '2px 6px', marginTop: '4px' }}>
                          {bimbingan.createdBy?.role === 'dosen' ? 'Dosen' : 'Mahasiswa'}
                        </span>
                      </td>
                      <td style={{ maxWidth: '400px' }}>{bimbingan.catatan || '-'}</td>
                      <td>
                        {bimbingan.file ? (
                          <a 
                            href={`http://localhost:5000/api/bimbingan/download/${bimbingan.file}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}
                          >
                            📄 Download File
                          </a>
                        ) : '-'}
                      </td>
                      <td>{formatDate(bimbingan.jadwalBimbinganSelanjutnya)}</td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(bimbingan.status)}`}>
                          {getStatusText(bimbingan.status)}
                        </span>
                      </td>
                      <td>
                        {user.role === 'dosen' && (
                          <select
                            value={bimbingan.status}
                            onChange={(e) => handleUpdateStatus(bimbingan._id, e.target.value)}
                            style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #ddd', marginRight: '8px' }}
                          >
                            <option value="pending">Menunggu Persetujuan</option>
                            <option value="approved">Disetujui</option>
                            <option value="revised">Perlu Revisi</option>
                          </select>
                        )}
                        {(user.role === 'admin' || (user.role === 'dosen' && (bimbingan.dosen._id === user._id || bimbingan.dosen === user._id))) && (
                          <button 
                            className="btn btn-danger" 
                            style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                            onClick={() => handleDelete(bimbingan._id)}
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

export default BimbinganList;
