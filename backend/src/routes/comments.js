// server/src/routes/comments.js
import express from 'express'
import authMiddleware from '../middleware/auth.js'

const router = express.Router()

// Will be implemented in Phase 4
router.get('/:snippetId', authMiddleware, (req, res) => {
  res.json({ message: 'comments route - coming in Phase 4' })
})

export default router