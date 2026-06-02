// backend/src/config/cors.js

const corsOptions = {
  origin: (origin, callback) => {

    const allowedOrigins = [
      'http://localhost:5173',
       'http://localhost:4173',
      'http://localhost:3000',
      process.env.CLIENT_URL,
    ].filter(Boolean)

    if (
      !origin ||
      allowedOrigins.includes(origin)
    ) {
      callback(null, true)
    } else {
      console.error(
        `[CORS] Blocked origin: ${origin}`
      )
      callback(
        new Error('Not allowed by CORS')
      )
    }
  },

  credentials: true,

  methods: [
    'GET',
    'POST',
    'PUT',
    'DELETE',
    'OPTIONS',
  ],

  allowedHeaders: [
    'Content-Type',
    'Authorization',
  ],
}

export default corsOptions