// frontend/src/api/snippets.js
import api from './axios.js'

export const createSnippet        = (data)     => api.post('/snippets', data)
export const getSnippets          = ()         => api.get('/snippets')
export const getSnippetById       = (id)       => api.get(`/snippets/${id}`)
export const getSnippetByShareId  = (shareId)  => api.get(`/snippets/share/${shareId}`)
export const deleteSnippet        = (id)       => api.delete(`/snippets/${id}`)