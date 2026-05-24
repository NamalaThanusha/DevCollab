// backend/src/socket/index.js

const setupSocket = (io) => {

  io.on('connection', (socket) => {

    console.log(
      `[Socket] Connected: ${socket.id}`
    )

    // Join snippet room
    socket.on(
      'join-snippet',
      ({ snippetId, username }) => {

        socket.join(snippetId)

        console.log(
          `[Socket] ${username} joined ${snippetId}`
        )

        // Viewer count
        const room =
          io.sockets.adapter.rooms.get(
            snippetId
          )

        const count =
          room ? room.size : 0

        io.to(snippetId).emit(
          'viewer-count',
          { count }
        )
      }
    )

    // Leave room
    socket.on(
      'leave-snippet',
      ({ snippetId }) => {

        socket.leave(snippetId)

        const room =
          io.sockets.adapter.rooms.get(
            snippetId
          )

        const count =
          room ? room.size : 0

        io.to(snippetId).emit(
          'viewer-count',
          { count }
        )
      }
    )

    // REALTIME COMMENTS
    socket.on(
      'new-comment',
      ({ snippetId, comment }) => {

        socket.to(snippetId).emit(
          'comment-added',
          comment
        )
      }
    )

    // REALTIME REACTIONS
    socket.on(
      'reaction-toggled',
      ({ snippetId, reactions }) => {

        socket.to(snippetId).emit(
          'reactions-updated',
          { reactions }
        )
      }
    )

    socket.on(
      'disconnect',
      () => {

        console.log(
          `[Socket] Disconnected: ${socket.id}`
        )
      }
    )
  })
}

export default setupSocket