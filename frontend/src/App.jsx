import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/auth/Login'
import Dashboard from './pages/dashboard/Dashboard'
import NewSchool from './pages/schools/NewSchool'
import SchoolDetail from './pages/schools/SchoolDetail'
import KillSwitch from './pages/schools/KillSwitch'
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
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/schools/new" element={
          <ProtectedRoute><NewSchool /></ProtectedRoute>
        } />
        <Route path="/schools/:id" element={
          <ProtectedRoute><SchoolDetail /></ProtectedRoute>
        } />
        <Route path="/schools/:id/kill" element={
          <ProtectedRoute><KillSwitch /></ProtectedRoute>
        } />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  )
}