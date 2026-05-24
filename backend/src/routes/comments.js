import express from 'express'
import { getComments, createComment, deleteComment } from '../controllers/commentController.js'
import authMiddleware from '../middleware/auth.js'

const router = express.Router()

// Get comments for a snippet (public - share view needs this)
router.get('/:snippetId', getComments)

// Create a comment (must be logged in)
router.post('/:snippetId', authMiddleware, createComment)

// Delete a comment (must be logged in)
router.delete('/comment/:commentId', authMiddleware, deleteComment)

export default router