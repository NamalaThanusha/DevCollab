import prisma from '../lib/prisma.js'

// Create a new snippet
export const createSnippet = async (req, res) => {
  try {
    const { title, code, language } = req.body
    const authorId = req.user.id

    if (!title || !code || !language) {
      return res.status(400).json({ message: 'Title, code, and language are required.' })
    }

    if (title.trim().length === 0) {
      return res.status(400).json({ message: 'Title cannot be empty.' })
    }

    const snippet = await prisma.snippet.create({
      data: {
        title: title.trim(),
        code,
        language,
        authorId,
      },
      include: {
        author: {
          select: { id: true, username: true, email: true }
        }
      }
    })

    return res.status(201).json({ snippet })
  } catch (error) {
    console.error('[CREATE SNIPPET ERROR]', error)
    return res.status(500).json({ message: 'Server error. Could not create snippet.' })
  }
}

// Get all snippets for logged in user
export const getSnippets = async (req, res) => {
  try {
    const authorId = req.user.id

    const snippets = await prisma.snippet.findMany({
      where: { authorId },
      include: {
        author: {
          select: { id: true, username: true }
        },
        _count: {
          select: { comments: true, reactions: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return res.status(200).json({ snippets })
  } catch (error) {
    console.error('[GET SNIPPETS ERROR]', error)
    return res.status(500).json({ message: 'Server error. Could not fetch snippets.' })
  }
}

// Get single snippet by ID (for editor page)
export const getSnippetById = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const snippet = await prisma.snippet.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, username: true }
        },
        comments: {
          include: {
            author: {
              select: { id: true, username: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        reactions: {
          include: {
            author: {
              select: { id: true, username: true }
            }
          }
        },
        _count: {
          select: { comments: true, reactions: true }
        }
      }
    })

    if (!snippet) {
      return res.status(404).json({ message: 'Snippet not found.' })
    }

    // Only author can access via this route
    if (snippet.authorId !== userId) {
      return res.status(403).json({ message: 'Access denied.' })
    }

    return res.status(200).json({ snippet })
  } catch (error) {
    console.error('[GET SNIPPET BY ID ERROR]', error)
    return res.status(500).json({ message: 'Server error.' })
  }
}

// Get snippet by shareId (public - no auth needed)
export const getSnippetByShareId = async (req, res) => {
  try {
    const { shareId } = req.params

    const snippet = await prisma.snippet.findUnique({
      where: { shareId },
      include: {
        author: {
          select: { id: true, username: true }
        },
        comments: {
          include: {
            author: {
              select: { id: true, username: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        reactions: {
          include: {
            author: {
              select: { id: true, username: true }
            }
          }
        },
        _count: {
          select: { comments: true, reactions: true }
        }
      }
    })

    if (!snippet) {
      return res.status(404).json({ message: 'Snippet not found.' })
    }

    return res.status(200).json({ snippet })
  } catch (error) {
    console.error('[GET SNIPPET BY SHARE ID ERROR]', error)
    return res.status(500).json({ message: 'Server error.' })
  }
}

// Delete snippet
export const deleteSnippet = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const snippet = await prisma.snippet.findUnique({
      where: { id }
    })

    if (!snippet) {
      return res.status(404).json({ message: 'Snippet not found.' })
    }

    if (snippet.authorId !== userId) {
      return res.status(403).json({ message: 'You can only delete your own snippets.' })
    }

    await prisma.snippet.delete({ where: { id } })

    return res.status(200).json({ message: 'Snippet deleted successfully.' })
  } catch (error) {
    console.error('[DELETE SNIPPET ERROR]', error)
    return res.status(500).json({ message: 'Server error.' })
  }
}