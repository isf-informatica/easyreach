import api from './axios'

export const getAllSchools = async () => {
  const res = await api.get('/api/schools/')
  return res.data
}

export const getSchool = async (id) => {
  const res = await api.get(`/api/schools/${id}`)
  return res.data
}

export const createSchool = async (data) => {
  const res = await api.post('/api/schools/', data)
  return res.data
}

export const updateSchool = async (id, data) => {
  const res = await api.put(`/api/schools/${id}`, data)
  return res.data
}

export const deleteSchool = async (id) => {
  const res = await api.delete(`/api/schools/${id}`)
  return res.data
}

export const getSchoolLogs = async (id) => {
  const res = await api.get(`/api/schools/${id}/logs`)
  return res.data
}

export const generateConfig = async (id) => {
  const res = await api.get(`/api/config/generate/${id}`, {
    responseType: 'blob'
  })
  return res.data
}