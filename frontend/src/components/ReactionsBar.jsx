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

  // LOAD REACTIONS
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

  // SOCKET LISTENER
  useEffect(() => {

    if (!socket) return

    const handleUpdatedReactions =
      ({
        reactions:
          updatedReactions,
      }) => {

        setReactions(
          updatedReactions
        )
      }

    socket.on(
      'reactions-updated',
      handleUpdatedReactions
    )

    return () => {

      socket.off(
        'reactions-updated',
        handleUpdatedReactions
      )
    }

  }, [socket])

  // TOGGLE REACTION
  const handleToggle = async (
    emoji
  ) => {

    setLoading(true)

    try {

      await toggleReaction(
        snippetId,
        { emoji }
      )

      const res =
        await getReactions(
          snippetId
        )

      const updatedReactions =
        res.data.reactions

      setReactions(
        updatedReactions
      )

      // REALTIME BROADCAST
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

    } catch (err) {

      const message =
        err.response?.data?.message ||
        'Failed to update reaction'

      toast.error(message)

    } finally {

      setLoading(false)
    }
  }

  // EMOJI STATE
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
              r.author?.id ===
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
              userReacted
                ? 'Remove reaction'
                : 'Add reaction'
            }
            className={`
              flex items-center gap-1.5
              px-2.5 py-1 rounded-full
              text-sm border
              transition-all duration-150
              disabled:cursor-not-allowed
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