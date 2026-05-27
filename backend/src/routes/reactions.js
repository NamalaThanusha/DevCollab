import express from 'express'

import {
  getReactions,
  toggleReaction,
} from '../controllers/reactionController.js'

import {
  optionalAuth,
} from '../middleware/auth.js'

const router = express.Router()

// PUBLIC
router.get(
  '/:snippetId',
  getReactions
)

// GUEST + LOGGED USERS
router.post(
  '/:snippetId',
  optionalAuth,
  toggleReaction
)

export default router