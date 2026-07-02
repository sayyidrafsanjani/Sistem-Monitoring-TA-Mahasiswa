import { useState } from 'react'
import axios from 'axios'

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState([])
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors([])
    setMessage('')

    try {
      const res = await axios.put('http://localhost:5000/api/auth/change-password', 
        { oldPassword, newPassword, confirmPassword }, 
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      )
      setMessage(res.data.message)
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
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

  return (
    <div className="card" style={{ maxWidth: '500px', margin: '2rem auto' }}>
      <h2 style={{ marginBottom: '2rem' }}>Ubah Password</h2>
      
      {message && (
        <div style={{ 
          marginBottom: '1rem', 
          padding: '1rem', 
          backgroundColor: message.includes('berhasil') ? '#d4edda' : '#f8d7da', 
          color: message.includes('berhasil') ? '#155724' : '#721c24', 
          borderRadius: '4px' 
        }}>
          {message}
        </div>
      )}
      
      {errors.length > 0 && (
        <div style={{ 
          marginBottom: '1rem', 
          padding: '1rem', 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          borderRadius: '4px' 
        }}>
          <ul>
            {errors.map((err, idx) => (
              <li key={idx}>{err.msg}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Password Lama</label>
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password Baru</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <small style={{ color: '#666' }}>Minimal 6 karakter</small>
        </div>
        <div className="form-group">
          <label>Konfirmasi Password Baru</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
          Ubah Password
        </button>
      </form>
    </div>
  )
}

export default ChangePassword
