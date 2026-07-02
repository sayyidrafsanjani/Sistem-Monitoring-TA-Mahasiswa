import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './components/Login'
import Navbar from './components/Navbar'
import ThesisList from './components/ThesisList'
import ThesisDetail from './components/ThesisDetail'
import BimbinganList from './components/BimbinganList'
import SeminarList from './components/SeminarList'
import DashboardMahasiswa from './components/DashboardMahasiswa'
import DashboardDosen from './components/DashboardDosen'
import DashboardAdmin from './components/DashboardAdmin'
import ChangePassword from './components/ChangePassword'
import UserManagement from './components/UserManagement'
import { NotificationProvider } from './context/NotificationContext'

function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const getDashboardByRole = () => {
    if (!user) return null
    switch (user.role) {
      case 'mahasiswa':
        return <DashboardMahasiswa user={user} />
      case 'dosen':
        return <DashboardDosen user={user} />
      case 'admin':
        return <DashboardAdmin user={user} />
      default:
        return <div>Role tidak dikenal</div>
    }
  }

  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!user) {
      return <Navigate to="/login" />
    }
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return <Navigate to="/dashboard" />
    }
    return children
  }

  return (
    <NotificationProvider user={user}>
      <Router>
        {user && <Navbar user={user} logout={logout} />}
        <div className="container">
          <Routes>
            <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={user ? getDashboardByRole() : <Navigate to="/login" />} />
            <Route path="/change-password" element={<ProtectedRoute allowedRoles={['mahasiswa', 'dosen', 'admin']}><ChangePassword /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute allowedRoles={['admin']}><UserManagement /></ProtectedRoute>} />
            <Route path="/theses" element={<ProtectedRoute allowedRoles={['mahasiswa', 'dosen', 'admin']}><ThesisList user={user} /></ProtectedRoute>} />
            <Route path="/theses/:id" element={<ProtectedRoute allowedRoles={['mahasiswa', 'dosen', 'admin']}><ThesisDetail user={user} /></ProtectedRoute>} />
            <Route path="/bimbingan" element={<ProtectedRoute allowedRoles={['mahasiswa', 'dosen', 'admin']}><BimbinganList user={user} /></ProtectedRoute>} />
            <Route path="/seminar" element={<ProtectedRoute allowedRoles={['mahasiswa', 'dosen', 'admin']}><SeminarList user={user} /></ProtectedRoute>} />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </Router>
    </NotificationProvider>
  )
}

export default App
