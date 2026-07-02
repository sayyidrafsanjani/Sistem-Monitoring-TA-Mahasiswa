import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [editId, setEditId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    role: 'mahasiswa',
    nim: '',
    nidn: '',
    password: ''
  })
  const [showResetModal, setShowResetModal] = useState(false)
  const [resetUserId, setResetUserId] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [errors, setErrors] = useState([])
  const [message, setMessage] = useState('')

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/auth/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setUsers(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors([])
    setMessage('')

    try {
      if (isEdit) {
        await axios.put(`http://localhost:5000/api/auth/users/${editId}`, 
          {
            name: formData.name,
            username: formData.username,
            email: formData.email,
            role: formData.role,
            nim: formData.role === 'mahasiswa' ? formData.nim : undefined,
            nidn: formData.role === 'dosen' ? formData.nidn : undefined
          }, 
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        )
        setMessage('Pengguna berhasil diperbarui')
      } else {
        await axios.post('http://localhost:5000/api/auth/users', 
          formData, 
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        )
        setMessage('Pengguna berhasil ditambahkan')
      }
      resetForm()
      fetchUsers()
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors)
      } else if (err.response?.data?.message) {
        setErrors([{ msg: err.response.data.message }])
      } else {
        setErrors([{ msg: 'Terjadi kesalahan. Silakan coba lagi.' }])
      }
    }
  }

  const handleEdit = (user) => {
    setIsEdit(true)
    setEditId(user._id)
    setFormData({
      name: user.name,
      username: user.username,
      email: user.email || '',
      role: user.role,
      nim: user.nim || '',
      nidn: user.nidn || '',
      password: ''
    })
    setShowForm(true)
    setErrors([])
    setMessage('')
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus pengguna ini?')) return

    try {
      await axios.delete(`http://localhost:5000/api/auth/users/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setMessage('Pengguna berhasil dihapus')
      fetchUsers()
    } catch (err) {
      if (err.response?.data?.message) {
        setErrors([{ msg: err.response.data.message }])
      } else {
        setErrors([{ msg: 'Terjadi kesalahan. Silakan coba lagi.' }])
      }
    }
  }

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setErrors([{ msg: 'Password baru minimal 6 karakter' }])
      return
    }

    try {
      await axios.put(`http://localhost:5000/api/auth/users/${resetUserId}/reset-password`, 
        { newPassword }, 
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      )
      setMessage('Password pengguna berhasil direset')
      setShowResetModal(false)
      setResetUserId(null)
      setNewPassword('')
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors)
      } else if (err.response?.data?.message) {
        setErrors([{ msg: err.response.data.message }])
      } else {
        setErrors([{ msg: 'Terjadi kesalahan. Silakan coba lagi.' }])
      }
    }
  }

  const resetForm = () => {
    setShowForm(false)
    setIsEdit(false)
    setEditId(null)
    setFormData({
      name: '',
      username: '',
      email: '',
      role: 'mahasiswa',
      nim: '',
      nidn: '',
      password: ''
    })
    setErrors([])
    setMessage('')
  }

  const getRoleText = (role) => {
    const roleMap = {
      'mahasiswa': 'Mahasiswa',
      'dosen': 'Dosen',
      'admin': 'Admin'
    }
    return roleMap[role] || role
  }

  return (
    <>
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Manajemen Pengguna</h1>
            <p>Kelola semua pengguna sistem</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Batal' : 'Tambah Pengguna'}
          </button>
        </div>

        {message && (
          <div className={`alert ${message.includes('berhasil') ? 'alert-success' : 'alert-error'}`}>
            {message}
          </div>
        )}

        {showForm && (
          <div className="card">
            <h2>{isEdit ? 'Edit Pengguna' : 'Tambah Pengguna'}</h2>
            
            {errors.length > 0 && (
              <div className="alert alert-error">
                <ul>
                  {errors.map((err, idx) => (
                    <li key={idx}>{err.msg}</li>
                  ))}
                </ul>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nama <span style={{ color: 'red' }}>*</span></label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Username <span style={{ color: 'red' }}>*</span></label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email (Opsional)</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Role <span style={{ color: 'red' }}>*</span></label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                >
                  <option value="mahasiswa">Mahasiswa</option>
                  <option value="dosen">Dosen</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {formData.role === 'mahasiswa' && (
                <div className="form-group">
                  <label>NIM</label>
                  <input
                    type="text"
                    value={formData.nim}
                    onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                  />
                </div>
              )}
              {formData.role === 'dosen' && (
                <div className="form-group">
                  <label>NIDN</label>
                  <input
                    type="text"
                    value={formData.nidn}
                    onChange={(e) => setFormData({ ...formData, nidn: e.target.value })}
                  />
                </div>
              )}
              {!isEdit && (
                <div className="form-group">
                  <label>Password Awal <span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <small>Minimal 6 karakter</small>
                </div>
              )}
              <div className="btn-group">
                <button type="submit" className="btn btn-primary">
                  {isEdit ? 'Perbarui' : 'Tambah'}
                </button>
                <button type="button" className="btn btn-danger" onClick={resetForm}>
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="card">
          {users.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>Belum ada pengguna.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>Username</th>
                    <th>Role</th>
                    <th>NIM/NIDN</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.username}</td>
                      <td>{getRoleText(user.role)}</td>
                      <td>{user.nim || user.nidn || '-'}</td>
                      <td style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button className="btn btn-success btn-sm" onClick={() => handleEdit(user)}>
                          Edit
                        </button>
                        <button 
                          className="btn btn-warning btn-sm" 
                          onClick={() => {
                            setResetUserId(user._id)
                            setShowResetModal(true)
                            setNewPassword('')
                            setErrors([])
                          }}
                        >
                          Reset Password
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(user._id)}>
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showResetModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Reset Password Pengguna</h3>
              {errors.length > 0 && (
                <div className="alert alert-error">
                  <ul>
                    {errors.map((err, idx) => (
                      <li key={idx}>{err.msg}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="form-group">
                <label>Password Baru <span style={{ color: 'red' }}>*</span></label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Masukkan password baru"
                />
                <small>Minimal 6 karakter</small>
              </div>
              <div className="btn-group">
                <button className="btn btn-primary" onClick={handleResetPassword}>
                  Reset Password
                </button>
                <button className="btn btn-danger" onClick={() => {
                  setShowResetModal(false)
                  setResetUserId(null)
                  setNewPassword('')
                  setErrors([])
                }}>
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}
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

export default UserManagement
