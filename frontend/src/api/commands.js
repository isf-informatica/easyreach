// frontend/src/api/commands.js
import api from './axios'

export const sendCommand = async (schoolId, commandType, payload = {}) => {
  const res = await api.post(`/easyreach/schools/${schoolId}/command`, {
    command_type: commandType,
    payload
  })
  return res.data
}

export const getCommandResult = async (commandId) => {
  const res = await api.get(`/easyreach/agent/command-result/${commandId}`)
  return res.data
}