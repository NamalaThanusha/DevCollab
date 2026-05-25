import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server } from 'socket.io'

import corsOptions from './src/config/cors.js'

import authRoutes from './src/routes/auth.js'
import snippetRoutes from './src/routes/snippets.js'
import commentRoutes from './src/routes/comments.js'
import reactionRoutes from './src/routes/reactions.js'
import aiRoutes from './src/routes/ai.js'

import setupSocket from './src/socket/index.js'

dotenv.config()

const app = express()

const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: corsOptions,
})

// Middleware
app.use(cors(corsOptions))
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/snippets', snippetRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/reactions', reactionRoutes)
app.use('/api/ai', aiRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'DevCollab server running 🚀',
  })
})

// Socket setup
setupSocket(io)

const PORT = process.env.PORT || 5000

httpServer.listen(PORT, () => {
  console.log(
    `🚀 Server running on http://localhost:${PORT}`
  )
})