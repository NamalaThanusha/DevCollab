import api from './axios.js'

export const analyzeCode = (data) =>
  api.post('/ai/analyze', data)