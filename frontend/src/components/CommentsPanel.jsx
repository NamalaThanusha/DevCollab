import {
  useState,
  useEffect,
} from 'react'

import { toast } from 'react-hot-toast'

import {
  getComments,
  createComment,
} from '../api/comments.js'

import useAuth from '../hooks/useAuth.js'

const CommentsPanel = ({
  snippetId,
  socket,
  isReadOnly = false,
}) => {

  const { user } =
    useAuth()

  const [comments, setComments] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [content, setContent] =
    useState('')

  const [lineNumber, setLineNumber] =
    useState(1)

  // LOAD COMMENTS
  useEffect(() => {

    if (!snippetId) return

    const loadComments =
      async () => {

        try {

          const res =
            await getComments(
              snippetId
            )

          setComments(
            res.data.comments
          )

        } catch {

          toast.error(
            'Failed to load comments'
          )

        } finally {

          setLoading(false)
        }
      }

    loadComments()

  }, [snippetId])

  // SOCKET LISTENERS
  useEffect(() => {

    if (!socket) return

    const handleNewComment =
      (comment) => {

        setComments((prev) => {

          const exists =
            prev.some(
              (c) =>
                c.id ===
                comment.id
            )

          if (exists) {
            return prev
          }

          return [
            ...prev,
            comment,
          ]
        })
      }

    socket.on(
      'comment-added',
      handleNewComment
    )

    return () => {

      socket.off(
        'comment-added',
        handleNewComment
      )
    }

  }, [socket])

  // SUBMIT COMMENT
  const handleSubmit =
    async (e) => {

      e.preventDefault()

      if (!content.trim()) {
        return
      }

      try {

        const res =
          await createComment(
            snippetId,
            {
              content:
                content.trim(),
              lineNumber,
            }
          )

        const newComment =
          res.data.comment

        setComments((prev) => [
          ...prev,
          newComment,
        ])

        if (socket) {

          socket.emit(
            'new-comment',
            {
              snippetId,
              comment:
                newComment,
            }
          )
        }

        setContent('')

        toast.success(
          'Comment added'
        )

      } catch {

        toast.error(
          'Failed to add comment'
        )
      }
    }

  if (loading) {

    return (
      <div className="h-full bg-[#161b22] border-l border-[#30363d] flex items-center justify-center text-gray-500 text-sm">
        Loading comments...
      </div>
    )
  }

  return (
    <div className="h-full bg-[#161b22] border-l border-[#30363d] flex flex-col">

      {/* HEADER */}
      <div className="px-4 py-3 border-b border-[#30363d]">

        <h3 className="text-white font-semibold">
          Comments
          <span className="ml-2 text-xs bg-[#30363d] text-gray-300 px-2 py-0.5 rounded-full">
            {comments.length}
          </span>
        </h3>

      </div>

      {/* COMMENTS LIST */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">

        {comments.length === 0 ? (

          <p className="text-gray-500 text-sm">
            No comments yet
          </p>

        ) : (

          comments.map((comment) => (

            <div
              key={comment.id}
              className="bg-[#0d1117] border border-[#30363d] rounded-xl p-3"
            >

              <div className="flex items-center justify-between mb-2">

                <div className="flex items-center gap-2">

                  <span className="text-blue-400 text-sm font-medium">
                    @{comment.author?.username}
                  </span>

                  <span className="text-xs bg-[#21262d] text-gray-400 px-2 py-0.5 rounded">
                    Line {comment.lineNumber}
                  </span>

                </div>

              </div>

              <p className="text-sm text-gray-200 whitespace-pre-wrap">
                {comment.content}
              </p>

            </div>
          ))
        )}

      </div>

      {/* FORM */}
      {!isReadOnly && user && (

        <form
          onSubmit={handleSubmit}
          className="border-t border-[#30363d] p-4 space-y-3"
        >

          <div>

            <label className="block text-xs text-gray-400 mb-1">
              Line
            </label>

            <input
              type="number"
              min="1"
              value={lineNumber}
              onChange={(e) =>
                setLineNumber(
                  Number(
                    e.target.value
                  )
                )
              }
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-white outline-none"
            />

          </div>

          <textarea
            value={content}
            onChange={(e) =>
              setContent(
                e.target.value
              )
            }
            placeholder="Add a comment..."
            rows={3}
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-white outline-none resize-none"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition-colors"
          >
            Post Comment
          </button>

        </form>
      )}

    </div>
  )
}

export default CommentsPanel