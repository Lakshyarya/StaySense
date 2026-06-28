import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useTheme } from './context/ThemeContext'
import { useAuth } from './context/AuthContext'

import Home          from './pages/Home'
import About         from './pages/About'
import Reviews       from './pages/Reviews'
import Enquiry       from './pages/Enquiry'
import Login         from './pages/Login'
import StaffHome     from './pages/staff/StaffHome'
import StaffAccommodation from './pages/staff/StaffAccommodation'
import StaffDashboard from './pages/StaffDashboard'

/* Wrap any staff route — redirects to /login if not authenticated */
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

export default function App() {
  const { theme } = useTheme()

  return (
    <>
      <Routes>
        {/* Public */}
        <Route path="/"        element={<Home />} />
        <Route path="/about"   element={<About />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/enquiry" element={<Enquiry />} />
        <Route path="/login"   element={<Login />} />

        {/* Staff — protected */}
        <Route path="/staff/dashboard"     element={<ProtectedRoute><StaffHome /></ProtectedRoute>} />
        <Route path="/staff/classifier"    element={<ProtectedRoute><StaffDashboard /></ProtectedRoute>} />
        <Route path="/staff/reviews"       element={<ProtectedRoute><StaffDashboard /></ProtectedRoute>} />
        <Route path="/staff/accommodation" element={<ProtectedRoute><StaffAccommodation /></ProtectedRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toaster
        position="top-right"
        gutter={8}
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize:   '14px',
            borderRadius: '12px',
            padding:    '12px 16px',
            boxShadow:  '0 8px 32px rgba(0,0,0,0.14)',
            background: theme === 'dark' ? '#1A1A1E' : '#ffffff',
            color:      theme === 'dark' ? '#f2f2f2'  : '#111827',
          },
          success: { iconTheme: { primary: '#0D9488', secondary: '#F0FDFB' } },
          error:   { iconTheme: { primary: '#DC2626', secondary: '#FEF2F2' } },
        }}
      />
    </>
  )
}
