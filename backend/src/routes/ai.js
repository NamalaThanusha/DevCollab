import express from 'express'
import { analyzeCode } from '../controllers/aiController.js'
import authMiddleware from '../middleware/auth.js'

const router = express.Router()

// Protected AI route
router.post(
  '/analyze',
  authMiddleware,
  analyzeCode
)

export default router