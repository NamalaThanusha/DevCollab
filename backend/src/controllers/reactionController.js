import prisma from '../lib/prisma.js'

// Get all reactions for a snippet
export const getReactions = async (req, res) => {
  try {
    const { snippetId } = req.params

    const reactions = await prisma.reaction.findMany({
      where: { snippetId },
      include: {
        author: {
          select: { id: true, username: true }
        }
      }
    })

    return res.status(200).json({ reactions })
  } catch (error) {
    console.error('[GET REACTIONS ERROR]', error)
    return res.status(500).json({ message: 'Server error.' })
  }
}

// Toggle a reaction (add if not exists, remove if exists)
export const toggleReaction = async (req, res) => {
  try {
    const { snippetId } = req.params
    const { emoji } = req.body
    const authorId = req.user.id

    const ALLOWED_EMOJIS = ['👍', '❤️', '🔥', '🎉', '👀', '💡']

    if (!emoji || !ALLOWED_EMOJIS.includes(emoji)) {
      return res.status(400).json({ message: 'Invalid emoji.' })
    }

    // Check if reaction already exists
    const existing = await prisma.reaction.findUnique({
      where: {
        snippetId_authorId_emoji: {
          snippetId,
          authorId,
          emoji,
        }
      }
    })

    if (existing) {
      // Remove reaction
      await prisma.reaction.delete({ where: { id: existing.id } })
      return res.status(200).json({ action: 'removed', emoji })
    } else {
      // Add reaction
      const reaction = await prisma.reaction.create({
        data: { emoji, snippetId, authorId },
        include: {
          author: {
            select: { id: true, username: true }
          }
        }
      })
      return res.status(201).json({ action: 'added', reaction })
    }
  } catch (error) {
    console.error('[TOGGLE REACTION ERROR]', error)
    return res.status(500).json({ message: 'Server error.' })
  }
}