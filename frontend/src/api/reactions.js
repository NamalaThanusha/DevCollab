import api from './axios.js'

export const getReactions   = (snippetId)  => api.get(`/reactions/${snippetId}`)
export const toggleReaction = (snippetId, data) => api.post(`/reactions/${snippetId}`, data)