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

// Required for Render / reverse proxies
app.set('trust proxy', 1)

const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.CLIENT_URL,
    ].filter(Boolean),
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
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
  res.status(200).json({
    status: 'OK',
    environment:
      process.env.NODE_ENV || 'development',
    timestamp:
      new Date().toISOString(),
  })
})

// Socket setup
setupSocket(io)

const PORT = process.env.PORT || 5000

httpServer.listen(PORT, () => {
  console.log(
    `🚀 Server running on port ${PORT}`
  )
})