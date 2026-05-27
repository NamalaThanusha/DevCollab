import prisma from '../lib/prisma.js'

// GET COMMENTS
export const getComments = async (
  req,
  res
) => {

  try {

    const { snippetId } =
      req.params

    const comments =
      await prisma.comment.findMany({
        where: { snippetId },

        include: {
          author: {
            select: {
              id: true,
              username: true,
            },
          },
        },

        orderBy: {
          createdAt: 'asc',
        },
      })

    return res.status(200).json({
      comments,
    })

  } catch (error) {

    console.error(
      '[GET COMMENTS ERROR]',
      error
    )

    return res.status(500).json({
      message: 'Server error.',
    })
  }
}

// CREATE COMMENT
export const createComment =
  async (req, res) => {

    try {

      const { snippetId } =
        req.params

      const {
        content,
        lineNumber,
      } = req.body

      const authorId =
        req.user?.id || null

      const username =
        req.user?.username ||
        'Guest'

      if (
        !content ||
        content.trim().length === 0
      ) {

        return res.status(400).json({
          message:
            'Comment cannot be empty.',
        })
      }

      if (
        lineNumber === undefined ||
        lineNumber === null
      ) {

        return res.status(400).json({
          message:
            'Line number is required.',
        })
      }

      // CHECK SNIPPET
      const snippet =
        await prisma.snippet.findUnique({
          where: { id: snippetId },
        })

      if (!snippet) {

        return res.status(404).json({
          message:
            'Snippet not found.',
        })
      }

      // LOGGED USER COMMENT
      if (authorId) {

        const comment =
          await prisma.comment.create({
            data: {
              content:
                content.trim(),

              lineNumber:
                parseInt(
                  lineNumber
                ),

              snippetId,

              authorId,
            },

            include: {
              author: {
                select: {
                  id: true,
                  username: true,
                },
              },
            },
          })

        return res.status(201).json({
          comment,
        })
      }

      // GUEST COMMENT
      const guestComment = {
        id:
          'guest-' +
          Date.now(),

        content:
          content.trim(),

        lineNumber:
          parseInt(lineNumber),

        snippetId,

        createdAt:
          new Date(),

        author: {
          id: null,
          username,
        },
      }

      return res.status(201).json({
        comment:
          guestComment,
      })

    } catch (error) {

      console.error(
        '[CREATE COMMENT ERROR]',
        error
      )

      return res.status(500).json({
        message: 'Server error.',
      })
    }
  }

// DELETE COMMENT
export const deleteComment =
  async (req, res) => {

    try {

      const { commentId } =
        req.params

      const userId =
        req.user.id

      const comment =
        await prisma.comment.findUnique({
          where: {
            id: commentId,
          },
        })

      if (!comment) {

        return res.status(404).json({
          message:
            'Comment not found.',
        })
      }

      if (
        comment.authorId !==
        userId
      ) {

        return res.status(403).json({
          message:
            'You can only delete your own comments.',
        })
      }

      await prisma.comment.delete({
        where: {
          id: commentId,
        },
      })

      return res.status(200).json({
        message:
          'Comment deleted.',
      })

    } catch (error) {

      console.error(
        '[DELETE COMMENT ERROR]',
        error
      )

      return res.status(500).json({
        message: 'Server error.',
      })
    }
  }