import { Link } from 'react-router-dom'
import { useNotifications } from '../context/NotificationContext'

const Navbar = ({ user, logout }) => {
  const { unreadCount, showNotificationModal, setShowNotificationModal, notifications, markAsRead, markAllAsRead } = useNotifications()
  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 1) return 'Baru saja'
    if (minutes < 60) return `${minutes} menit yang lalu`
    if (hours < 24) return `${hours} jam yang lalu`
    return `${days} hari yang lalu`
  }
  const getRoleText = (role) => {
    const roles = {
      'mahasiswa': 'Mahasiswa',
      'dosen': 'Dosen Pembimbing',
      'admin': 'Administrator'
    }
    return roles[role] || role
  }

  const renderMenu = () => {
    switch (user.role) {
      case 'admin':
        return (
          <>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/users">Manajemen Pengguna</Link></li>
            <li><Link to="/theses">Tugas Akhir</Link></li>
            <li><Link to="/bimbingan">Bimbingan</Link></li>
          </>
        )
      case 'dosen':
        return (
          <>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/theses">Tugas Akhir</Link></li>
            <li><Link to="/bimbingan">Bimbingan</Link></li>
          </>
        )
      case 'mahasiswa':
        return (
          <>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/theses">Tugas Akhir</Link></li>
            <li><Link to="/bimbingan">Bimbingan</Link></li>
          </>
        )
      default:
        return null
    }
  }

  return (
    <>
      <div className="top-bar">
        <div className="top-bar-content">
          <span>Selamat Datang di Sistem Monitoring Tugas Akhir</span>
          <div>
            <span>{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </div>
      <nav className="navbar">
        <div className="navbar-content">
          <div className="logo-section">
            <div className="logo-icon">TA</div>
            <div className="logo-text">
              <h1>Sistem Monitoring TA</h1>
              <p>Pengelolaan Tugas Akhir Mahasiswa</p>
            </div>
          </div>
          <ul className="nav-links">
            {renderMenu()}
            <li className="notification-bell">
              <button 
                onClick={() => setShowNotificationModal(!showNotificationModal)}
                style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                🔔
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    background: 'var(--primary-color)',
                    color: 'white',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    fontSize: '0.7rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>
            </li>
            <li className="user-info">
              <Link to="/change-password">Ubah Password</Link>
              <div>
                <span className="user-name">{user.name}</span>
                <span className="user-role">({getRoleText(user.role)})</span>
              </div>
              <button onClick={logout} className="btn btn-danger btn-sm">
                Logout
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Notification Modal */}
      {showNotificationModal && (
        <div className="modal-overlay" onClick={() => setShowNotificationModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2>Notifikasi</h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="btn btn-sm btn-primary">Tandai Semua Dibaca</button>
                )}
                <button onClick={() => setShowNotificationModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
              </div>
            </div>
            <div className="modal-body">
              {notifications.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>Tidak ada notifikasi</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {notifications.map(notif => (
                    <div 
                      key={notif._id} 
                      onClick={() => !notif.isRead && markAsRead(notif._id)}
                      style={{
                        padding: '1rem',
                        borderRadius: '8px',
                        background: notif.isRead ? '#f5f5f5' : '#e3f2fd',
                        cursor: 'pointer',
                        borderLeft: notif.isRead ? '4px solid #ccc' : '4px solid var(--primary-color)'
                      }}
                    >
                      <p style={{ margin: 0, fontWeight: notif.isRead ? 'normal' : 'bold' }}>{notif.message}</p>
                      <small style={{ color: '#666' }}>
                        {notif.sender?.name} • {formatDate(notif.createdAt)}
                      </small>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Navbar
