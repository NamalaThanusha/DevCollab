// backend/src/socket/index.js

const setupSocket = (io) => {

  io.on('connection', (socket) => {

    console.log(
      `[Socket] Connected: ${socket.id}`
    )

    // JOIN SNIPPET
    socket.on(
      'join-snippet',
      ({ snippetId, username }) => {

        socket.join(snippetId)

        console.log(
          `[Socket] ${username} joined ${snippetId}`
        )

        // GLOBAL VIEWER COUNT
        const count =
          io.engine.clientsCount

        io.emit(
          'viewer-count',
          { count }
        )
      }
    )

    // LEAVE SNIPPET
    socket.on(
      'leave-snippet',
      ({ snippetId }) => {

        socket.leave(snippetId)

        // GLOBAL VIEWER COUNT
        const count =
          io.engine.clientsCount

        io.emit(
          'viewer-count',
          { count }
        )
      }
    )

    // REALTIME COMMENTS
    socket.on(
      'new-comment',
      ({ snippetId, comment }) => {

        // SEND TO EVERYONE
        io.emit(
          'comment-added',
          comment
        )
      }
    )

    // REALTIME REACTIONS
    socket.on(
      'reaction-toggled',
      ({ reactions }) => {

        // SEND TO EVERYONE
        io.emit(
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

        // UPDATE VIEWER COUNT
        const count =
          io.engine.clientsCount

        io.emit(
          'viewer-count',
          { count }
        )
      }
    )
  })
}

export default setupSocket