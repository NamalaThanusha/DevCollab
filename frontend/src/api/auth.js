// frontend/src/api/auth.js
import api from './axios.js'

export const registerUser = (data) => api.post('/auth/register', data)
export const loginUser   = (data) => api.post('/auth/login', data)
export const getMe       = ()     => api.get('/auth/me')