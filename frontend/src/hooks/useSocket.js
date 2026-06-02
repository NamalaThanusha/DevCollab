import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

const useSocket = (snippetId, username) => {

  const socketRef = useRef(null)

  const [viewerCount, setViewerCount] =
    useState(1)

  useEffect(() => {

    if (!snippetId) return

    // Connect to backend socket server
    const socketURL =
  import.meta.env.VITE_SOCKET_URL ||
  'http://localhost:5000'

socketRef.current = io(
  socketURL,
  {
    transports: [
      'websocket',
      'polling',
    ],
  }
)

    const socket = socketRef.current

    // Connected
    socket.on('connect', () => {

      console.log(
        '[Socket] Connected:',
        socket.id
      )

      // Join snippet room
      socket.emit(
        'join-snippet',
        {
          snippetId,
          username,
        }
      )
    })

    // Viewer count updates
    socket.on(
      'viewer-count',
      ({ count }) => {

        setViewerCount(count)
      }
    )

    // Cleanup
    return () => {

      if (socket) {

        socket.emit(
          'leave-snippet',
          {
            snippetId,
          }
        )

        socket.disconnect()
      }
    }

  }, [snippetId, username])

  // Emit event
  const emit = (event, data) => {

    if (socketRef.current) {

      socketRef.current.emit(
        event,
        data
      )
    }
  }

  // Listen event
  const on = (
    event,
    callback
  ) => {

    if (socketRef.current) {

      socketRef.current.on(
        event,
        callback
      )
    }
  }

  // Stop listening
  const off = (event) => {

    if (socketRef.current) {

      socketRef.current.off(
        event
      )
    }
  }

  return {
    emit,
    on,
    off,
    viewerCount,
  }
}

export default useSocket