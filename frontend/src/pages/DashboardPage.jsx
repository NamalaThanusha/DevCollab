import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { getSnippets, deleteSnippet } from '../api/snippets.js'
import Navbar from '../components/Navbar.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'

// Language badge colors
const LANG_COLORS = {
  javascript: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  typescript: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  python: 'bg-green-500/10 text-green-400 border-green-500/20',
  java: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  cpp: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  c: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  csharp: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  go: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  rust: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  php: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  default: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
}

const getLangColor = (lang) => {
  return LANG_COLORS[lang] || LANG_COLORS.default
}

const formatDate = (dateString) => {
  const date = new Date(dateString)

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const DashboardPage = () => {
  const navigate = useNavigate()

  const [snippets, setSnippets] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)

  // Load snippets
  useEffect(() => {
    const loadSnippets = async () => {
      try {
        const res = await getSnippets()
        setSnippets(res.data.snippets)
      } catch {
        toast.error('Failed to load snippets')
      } finally {
        setLoading(false)
      }
    }

    loadSnippets()
  }, [])

  // Delete snippet
  const handleDelete = async (e, snippetId) => {
    e.stopPropagation()

    const confirmed = window.confirm(
      'Delete this snippet? This cannot be undone.'
    )

    if (!confirmed) return

    setDeleting(snippetId)

    try {
      await deleteSnippet(snippetId)

      setSnippets((prev) =>
        prev.filter((snippet) => snippet.id !== snippetId)
      )

      toast.success('Snippet deleted')
    } catch {
      toast.error('Failed to delete snippet')
    } finally {
      setDeleting(null)
    }
  }

  // Copy share link
  const handleCopyShareLink = (e, shareId) => {
    e.stopPropagation()

    const link = `${window.location.origin}/share/${shareId}`

    navigator.clipboard.writeText(link)

    toast.success('Share link copied!')
  }

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">

          <div>
            <h1 className="text-2xl font-bold text-white">
              My Snippets
            </h1>

            <p className="text-gray-500 text-sm mt-1">
              {snippets.length} snippet
              {snippets.length !== 1 ? 's' : ''}
            </p>
          </div>

          <button
            onClick={() => navigate('/editor/new')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            <span className="text-lg leading-none">+</span>
            New Snippet
          </button>

        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* Empty State */}
        {!loading && snippets.length === 0 && (
          <div className="text-center py-20">

            <div className="text-5xl mb-4">
              📝
            </div>

            <h3 className="text-white font-medium text-lg mb-2">
              No snippets yet
            </h3>

            <p className="text-gray-500 text-sm mb-6">
              Create your first code snippet to get started
            </p>

            <button
              onClick={() => navigate('/editor/new')}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
            >
              Create your first snippet
            </button>

          </div>
        )}

        {/* Snippets Grid */}
        {!loading && snippets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            {snippets.map((snippet) => (
              <div
                key={snippet.id}
                onClick={() => navigate(`/editor/${snippet.id}`)}
                className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 cursor-pointer hover:border-[#484f58] hover:bg-[#1c2128] transition-all group"
              >

                {/* Top */}
                <div className="flex items-start justify-between gap-2 mb-3">

                  <h3 className="text-white font-medium text-sm leading-snug line-clamp-2 flex-1">
                    {snippet.title}
                  </h3>

                  <span
                    className={`shrink-0 text-xs px-2 py-0.5 rounded-md border ${getLangColor(snippet.language)}`}
                  >
                    {snippet.language}
                  </span>

                </div>

                {/* Code Preview */}
                <div className="bg-[#0d1117] rounded-lg p-3 mb-4 overflow-hidden h-20">

                  <pre className="text-gray-500 text-xs font-mono leading-relaxed overflow-hidden">
                    {snippet.code.slice(0, 150)}
                    {snippet.code.length > 150 ? '...' : ''}
                  </pre>

                </div>

                {/* Bottom */}
                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>💬 {snippet._count.comments}</span>
                    <span>✨ {snippet._count.reactions}</span>
                    <span>{formatDate(snippet.createdAt)}</span>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">

                    {/* Share */}
                    <button
                      onClick={(e) =>
                        handleCopyShareLink(e, snippet.shareId)
                      }
                      title="Copy share link"
                      className="p-1.5 text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-md transition-colors"
                    >
                      🔗
                    </button>

                    {/* Delete */}
                    <button
                      onClick={(e) =>
                        handleDelete(e, snippet.id)
                      }
                      title="Delete snippet"
                      disabled={deleting === snippet.id}
                      className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors disabled:opacity-50"
                    >
                      {deleting === snippet.id ? '...' : '🗑️'}
                    </button>

                  </div>

                </div>

              </div>
            ))}

          </div>
        )}

      </main>
    </div>
  )
}

export default DashboardPage