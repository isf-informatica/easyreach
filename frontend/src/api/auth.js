import api from './axios'

export const login = async (email, password) => {
  const formData = new FormData()
  formData.append('username', email)
  formData.append('password', password)
  const res = await api.post('/api/auth/login', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  })
  return res.data
}

export const getMe = async () => {
  const res = await api.get('/api/auth/me')
  return res.data
}