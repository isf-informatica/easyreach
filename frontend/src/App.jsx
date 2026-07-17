import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/auth/Login'
import Dashboard from './pages/dashboard/Dashboard'
import NewSchool from './pages/schools/NewSchool'
import SchoolDetail from './pages/schools/SchoolDetail'
import KillSwitch from './pages/schools/KillSwitch'
import SetupGuide from './pages/schools/SetupGuide'
import SmartSetup from './pages/schools/SmartSetup'
import Devices from './pages/schools/Devices'
import useAuthStore from './store/authStore'

function ProtectedRoute({ children }) {
  const { token } = useAuthStore()
  return token ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/schools/new" element={<ProtectedRoute><NewSchool /></ProtectedRoute>} />
        <Route path="/schools/setup" element={<ProtectedRoute><SmartSetup /></ProtectedRoute>} />
        <Route path="/schools/:id" element={<ProtectedRoute><SchoolDetail /></ProtectedRoute>} />
        <Route path="/schools/:id/kill" element={<ProtectedRoute><KillSwitch /></ProtectedRoute>} />
        <Route path="/schools/:id/setup" element={<ProtectedRoute><SetupGuide /></ProtectedRoute>} />
        <Route path="/schools/:id/devices" element={<ProtectedRoute><Devices /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  )
}