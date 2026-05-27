import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { getSnippets, deleteSnippet } from '../api/snippets.js'
import Navbar from '../components/Navbar.jsx'

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

  // NEW
  const [search, setSearch] = useState('')
  const [languageFilter, setLanguageFilter] = useState('all')

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

  // FILTERED SNIPPETS
  const filteredSnippets = snippets.filter((snippet) => {
    const matchesSearch =
      snippet.title
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      snippet.code
        .toLowerCase()
        .includes(search.toLowerCase())

    const matchesLanguage =
      languageFilter === 'all' ||
      snippet.language === languageFilter

    return matchesSearch && matchesLanguage
  })

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-10 fade-in">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">

          <div>
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium px-3 py-1 rounded-full mb-4">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              Developer Workspace
            </div>

            <h1 className="text-3xl font-bold text-white">
              My Snippets
            </h1>

            <p className="text-gray-500 text-sm mt-2">
              Manage, organize and collaborate on your code snippets
            </p>
          </div>

          <button
            onClick={() => navigate('/editor/new')}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-3 rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-blue-500/10"
          >
            <span className="text-lg leading-none">+</span>
            New Snippet
          </button>

        </div>

        {/* Search + Filter */}
        {!loading && snippets.length > 0 && (
          <div className="flex flex-col md:flex-row gap-3 mb-8">

            {/* Search */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search snippets by title or code..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="w-full bg-[#161b22] border border-[#30363d] text-white placeholder-gray-500 rounded-xl px-4 py-3 pl-11 focus:outline-none focus:border-blue-500 transition-colors"
              />

              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                🔍
              </span>
            </div>

            {/* Filter */}
            <select
              value={languageFilter}
              onChange={(e) =>
                setLanguageFilter(e.target.value)
              }
              className="bg-[#161b22] border border-[#30363d] text-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="all">
                All Languages
              </option>

              {[
                ...new Set(
                  snippets.map(
                    (s) => s.language
                  )
                ),
              ].map((lang) => (
                <option
                  key={lang}
                  value={lang}
                >
                  {lang}
                </option>
              ))}
            </select>

          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5 animate-pulse"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="h-4 bg-[#21262d] rounded w-3/4" />
                  <div className="h-5 bg-[#21262d] rounded-md w-16 shrink-0" />
                </div>

                <div className="bg-[#0d1117] rounded-xl p-3 mb-4 h-20 space-y-2">
                  <div className="h-2.5 bg-[#21262d] rounded w-full" />
                  <div className="h-2.5 bg-[#21262d] rounded w-4/5" />
                  <div className="h-2.5 bg-[#21262d] rounded w-3/5" />
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-3 bg-[#21262d] rounded w-8" />
                  <div className="h-3 bg-[#21262d] rounded w-8" />
                  <div className="h-3 bg-[#21262d] rounded w-20" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredSnippets.length === 0 && (
          <div className="text-center py-28 fade-in">

            <div className="text-6xl mb-5">
              🚀
            </div>

            <h3 className="text-white font-semibold text-2xl mb-3">
              No snippets found
            </h3>

            <p className="text-gray-500 text-sm mb-8 max-w-md mx-auto">
              Try changing your search or create a new snippet
            </p>

            <button
              onClick={() => navigate('/editor/new')}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-6 py-3 rounded-xl transition-all hover:scale-[1.02]"
            >
              Create Snippet
            </button>

          </div>
        )}

        {/* Snippets Grid */}
        {!loading && filteredSnippets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

            {filteredSnippets.map((snippet) => (
              <div
                key={snippet.id}
                onClick={() =>
                  navigate(`/editor/${snippet.id}`)
                }
                className="group bg-[#161b22] border border-[#30363d] rounded-2xl p-5 cursor-pointer hover:border-blue-500/30 hover:bg-[#1b222c] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/5"
              >

                {/* Top */}
                <div className="flex items-start justify-between gap-2 mb-4">

                  <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2 flex-1">
                    {snippet.title}
                  </h3>

                  <span
                    className={`shrink-0 text-xs px-2 py-0.5 rounded-md border ${getLangColor(snippet.language)}`}
                  >
                    {snippet.language}
                  </span>

                </div>

                {/* Code Preview */}
                <div className="bg-[#0d1117] border border-[#21262d] rounded-xl p-4 mb-5 overflow-hidden h-24">

                  <pre className="text-gray-500 text-xs font-mono leading-relaxed overflow-hidden">
                    {snippet.code.slice(0, 160)}
                    {snippet.code.length > 160 ? '...' : ''}
                  </pre>

                </div>

                {/* Bottom */}
                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>
                      💬 {snippet._count.comments}
                    </span>

                    <span>
                      ✨ {snippet._count.reactions}
                    </span>

                    <span>
                      {formatDate(snippet.createdAt)}
                    </span>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">

                    {/* Share */}
                    <button
                      onClick={(e) =>
                        handleCopyShareLink(
                          e,
                          snippet.shareId
                        )
                      }
                      title="Copy share link"
                      className="p-2 text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                    >
                      🔗
                    </button>

                    {/* Delete */}
                    <button
                      onClick={(e) =>
                        handleDelete(
                          e,
                          snippet.id
                        )
                      }
                      title="Delete snippet"
                      disabled={deleting === snippet.id}
                      className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {deleting === snippet.id
                        ? '...'
                        : '🗑️'}
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