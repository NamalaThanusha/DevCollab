import api from './axios.js'

export const getComments    = (snippetId)              => api.get(`/comments/${snippetId}`)
export const createComment  = (snippetId, data)        => api.post(`/comments/${snippetId}`, data)
export const deleteComment  = (commentId)              => api.delete(`/comments/comment/${commentId}`)