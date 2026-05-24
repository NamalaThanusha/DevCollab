import { useState, useEffect } from 'react'

import { toast } from 'react-hot-toast'

import {
  getReactions,
  toggleReaction,
} from '../api/reactions.js'

import useAuth from '../hooks/useAuth.js'

const EMOJIS = [
  '👍',
  '❤️',
  '🔥',
  '🎉',
  '👀',
  '💡',
]

const ReactionsBar = ({
  snippetId,
  socket,
}) => {

  const { user } = useAuth()

  const [reactions, setReactions] =
    useState([])

  const [loading, setLoading] =
    useState(false)

  // Load reactions
  useEffect(() => {

    if (!snippetId) return

    const loadReactions =
      async () => {

        try {

          const res =
            await getReactions(
              snippetId
            )

          setReactions(
            res.data.reactions
          )

        } catch {

          // Silent fail
        }
      }

    loadReactions()

  }, [snippetId])

  // Socket listeners
  useEffect(() => {

    if (!socket) return

    socket.on(
      'reactions-updated',
      ({
        reactions:
          updatedReactions,
      }) => {

        setReactions(
          updatedReactions
        )
      }
    )

    // Cleanup
    return () => {

      socket.off(
        'reactions-updated'
      )
    }

  }, [socket])

  // Toggle reaction
  const handleToggle = async (
    emoji
  ) => {

    if (!user) {

      toast.error(
        'Sign in to react'
      )

      return
    }

    setLoading(true)

    try {

      await toggleReaction(
        snippetId,
        { emoji }
      )

      // Refresh reactions
      const res =
        await getReactions(
          snippetId
        )

      const updatedReactions =
        res.data.reactions

      setReactions(
        updatedReactions
      )

      // Broadcast
      if (socket) {

        socket.emit(
          'reaction-toggled',
          {
            snippetId,
            reactions:
              updatedReactions,
          }
        )
      }

    } catch {

      toast.error(
        'Failed to update reaction'
      )

    } finally {

      setLoading(false)
    }
  }

  // Emoji data
  const getEmojiData = (
    emoji
  ) => {

    const emojiReactions =
      reactions.filter(
        (r) =>
          r.emoji === emoji
      )

    const userReacted =
      user
        ? emojiReactions.some(
            (r) =>
              r.author.id ===
              user.id
          )
        : false

    return {
      count:
        emojiReactions.length,
      userReacted,
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">

      {EMOJIS.map((emoji) => {

        const {
          count,
          userReacted,
        } = getEmojiData(
          emoji
        )

        return (

          <button
            key={emoji}
            onClick={() =>
              handleToggle(
                emoji
              )
            }
            disabled={loading}
            title={
              !user
                ? 'Sign in to react'
                : userReacted
                  ? 'Remove reaction'
                  : 'Add reaction'
            }
            className={`
              flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm
              border transition-all duration-150 disabled:cursor-not-allowed
              ${
                userReacted
                  ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                  : 'bg-[#21262d] border-[#30363d] text-gray-400 hover:border-[#484f58] hover:text-gray-200'
              }
            `}
          >

            <span>
              {emoji}
            </span>

            {count > 0 && (
              <span className="text-xs font-medium">
                {count}
              </span>
            )}

          </button>
        )
      })}

    </div>
  )
}

export default ReactionsBar