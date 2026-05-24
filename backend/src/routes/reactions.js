import express from 'express'
import { getReactions, toggleReaction } from '../controllers/reactionController.js'
import authMiddleware from '../middleware/auth.js'

const router = express.Router()

// Get reactions for a snippet (public)
router.get('/:snippetId', getReactions)

// Toggle a reaction (must be logged in)
router.post('/:snippetId', authMiddleware, toggleReaction)

export default router