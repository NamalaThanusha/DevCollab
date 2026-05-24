import express from 'express'
import {
  createSnippet,
  getSnippets,
  getSnippetById,
  getSnippetByShareId,
  deleteSnippet
} from '../controllers/snippetController.js'
import authMiddleware from '../middleware/auth.js'

const router = express.Router()

// Public route - no auth needed (for share links)
router.get('/share/:shareId', getSnippetByShareId)

// Protected routes - must be logged in
router.get('/', authMiddleware, getSnippets)
router.post('/', authMiddleware, createSnippet)
router.get('/:id', authMiddleware, getSnippetById)
router.delete('/:id', authMiddleware, deleteSnippet)

export default router