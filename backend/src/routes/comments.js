import express from 'express'

import {
  getComments,
  createComment,
  deleteComment,
} from '../controllers/commentController.js'

import {
  authMiddleware,
  optionalAuth,
} from '../middleware/auth.js'

const router = express.Router()

// PUBLIC
router.get(
  '/:snippetId',
  getComments
)

// GUEST + LOGGED USERS
router.post(
  '/:snippetId',
  optionalAuth,
  createComment
)

// ONLY LOGGED USERS
router.delete(
  '/comment/:commentId',
  authMiddleware,
  deleteComment
)

export default router