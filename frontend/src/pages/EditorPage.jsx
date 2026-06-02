import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import Editor from '@monaco-editor/react'
import { io } from 'socket.io-client'

import {
  createSnippet,
  getSnippetById,
  getSnippetByShareId,
} from '../api/snippets.js'

import { analyzeCode } from '../api/ai.js'

import useAuth from '../hooks/useAuth.js'

import Navbar from '../components/Navbar.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import CommentsPanel from '../components/CommentsPanel.jsx'
import ReactionsBar from '../components/ReactionsBar.jsx'
import AIReviewPanel from '../components/AIReviewPanel.jsx'

import {
  LANGUAGES,
  DEFAULT_CODE,
} from '../constants.js'

const EditorPage = () => {
  const { id, shareId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const socketRef = useRef(null)

  const [socketInstance, setSocketInstance] = useState(null)

  const isShareView = Boolean(shareId)
  const isNew = id === 'new'

  // ── The room ID is always the snippet's shareId when on share route,
  //    otherwise it's the snippet's DB id.
  const snippetRoomId = isShareView ? shareId : id

  // ── Edit permissions are separate from view permissions.
  //    Only the snippet author can edit.
  //    isShareView only controls code editor readOnly + save/AI trigger.


  // ── Guest display name used for socket events
  const displayName = user?.username || 'Guest'

  const [snippet, setSnippet]         = useState(null)
  const [title, setTitle]             = useState('')
  const [code, setCode]               = useState(DEFAULT_CODE.javascript)
  const [language, setLanguage]       = useState('javascript')
  const [loading, setLoading]         = useState(!isNew)
  const [saving, setSaving]           = useState(false)
  const [shareLink, setShareLink]     = useState('')
  const [viewerCount, setViewerCount] = useState(1)
  const [showComments, setShowComments] = useState(true)
  const [showAIPanel, setShowAIPanel]   = useState(false)
  const [aiAnalysis, setAiAnalysis]     = useState(null)
  const [aiLoading, setAiLoading]       = useState(false)
  const [aiError, setAiError]           = useState(null)

  // ── Load snippet data
  useEffect(() => {
    if (isNew) return

    const fetchSnippet = async () => {
      try {
        let res

        if (isShareView) {
          res = await getSnippetByShareId(shareId)
        } else {
          res = await getSnippetById(id)
        }

        const s = res.data.snippet

        setSnippet(s)
        setTitle(s.title)
        setCode(s.code)
        setLanguage(s.language)
        setShareLink(
          `${window.location.origin}/share/${s.shareId}`
        )
      } catch {
        toast.error('Snippet not found')
        navigate('/dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchSnippet()
  }, [id, shareId, isNew, isShareView, navigate])

  // ── Socket connection
  //    IMPORTANT: Guests on share view ALSO connect to the room.
  //    This is what makes viewer count increase for guests and
  //    allows them to receive/send realtime events.
  useEffect(() => {
    if (isNew || !snippetRoomId) return

    const socketURL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'
const socket = io(socketURL, {
  transports: ['websocket', 'polling'],
})

    socketRef.current = socket

    // Small timeout so socketInstance state is set after render
    setTimeout(() => {
      setSocketInstance(socket)
    }, 0)

    socket.on('connect', () => {
      // Both logged-in users AND guests join the room
      socket.emit('join-snippet', {
        snippetId: snippetRoomId,
        username: displayName,
      })
    })

    socket.on('viewer-count', ({ count }) => {
      setViewerCount(count)
    })

    socket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message)
    })

    return () => {
      socket.emit('leave-snippet', { snippetId: snippetRoomId })
      socket.disconnect()
      socketRef.current = null
      setSocketInstance(null)
    }
  }, [isNew, snippetRoomId, displayName])

  // ── Language change — only meaningful for new snippets
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang)
    if (isNew) {
      setCode(DEFAULT_CODE[newLang] || DEFAULT_CODE.default)
    }
  }

  // ── Save — only for logged-in users creating a new snippet
  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Please add a title')
      return
    }
    if (!code.trim()) {
      toast.error('Code cannot be empty')
      return
    }

    setSaving(true)

    try {
      const res = await createSnippet({
        title: title.trim(),
        code,
        language,
      })

      toast.success('Snippet saved!')
      navigate(`/editor/${res.data.snippet.id}`, { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(shareLink)
    toast.success('Share link copied!')
  }

  // ── AI Review — only for logged-in users, not guests
  const handleAIReview = async () => {
    if (!code.trim()) {
      toast.error('No code to analyze')
      return
    }

    setShowAIPanel(true)
    setShowComments(false)
    setAiAnalysis(null)
    setAiError(null)
    setAiLoading(true)

    try {
      const res = await analyzeCode({ code, language })
      setAiAnalysis(res.data.analysis)
    } catch (err) {
      const message =
        err.response?.data?.message || 'AI analysis failed.'
      setAiError(message)
      toast.error(message)
    } finally {
      setAiLoading(false)
    }
  }

  const handleCloseAI = () => {
    setShowAIPanel(false)
    setAiAnalysis(null)
    setAiError(null)
  }

  const isAuthor = user && snippet && snippet.author.id === user.id

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="h-screen bg-[#0a0f17] flex flex-col overflow-hidden">

      {/* Navbar — only for authenticated view */}
      {!isShareView && <Navbar />}

      {/* Share view top banner */}
      {isShareView && (
        <div className="bg-[#111827]/95 backdrop-blur-xl border-b border-[#1f2937] px-6 py-3 flex items-center justify-between shrink-0">
          <span className="text-white font-bold text-lg">
            Dev<span className="text-blue-500">Collab</span>
          </span>
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-sm">
              Shared by{' '}
              <span className="text-white font-medium">
                @{snippet?.author?.username}
              </span>
            </span>
            {/* Viewer count in share banner */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#1f2937] bg-[#0f172a] text-sm text-gray-400">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>{viewerCount} viewing</span>
            </div>
            {!user && (
              <button
                onClick={() => navigate('/register')}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
              >
                Sign up free
              </button>
            )}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-[#111827]/95 backdrop-blur-xl border-b border-[#1f2937] px-5 py-3 flex items-center justify-between gap-4 shrink-0 overflow-x-auto">

        {/* LEFT — title */}
        <div className="flex items-center min-w-0 flex-1">
          {(isNew || isAuthor) && !isShareView ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled Snippet"
              className="bg-transparent text-white text-lg font-semibold placeholder-gray-500 focus:outline-none min-w-[220px] max-w-[420px]"
            />
          ) : (
            <h2 className="text-white text-lg font-semibold truncate">
              {title}
            </h2>
          )}
        </div>

        {/* RIGHT — controls */}
        <div className="flex items-center gap-3 shrink-0">

          {/* Viewer count — only shown in authenticated toolbar (share view shows it in banner) */}
          {!isNew && !isShareView && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#1f2937] bg-[#0f172a] text-sm text-gray-400">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>{viewerCount} viewing</span>
            </div>
          )}

          {/* Language selector — always visible, disabled for share view */}
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            disabled={isShareView || (!isNew && !isAuthor)}
            className="bg-[#1e293b] border border-[#334155] text-gray-200 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 disabled:opacity-60"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>

          {/* AI Review — only for logged-in users, NOT guests */}
          {!isNew && user && !isShareView && (
            <button
              onClick={handleAIReview}
              disabled={aiLoading}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                showAIPanel
                  ? 'bg-purple-500/15 border-purple-500/40 text-purple-300 shadow-lg shadow-purple-500/10'
                  : 'bg-[#1e293b] border-[#334155] text-gray-300 hover:border-purple-500/40 hover:text-white'
              }`}
            >
              {aiLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Analyzing</span>
                </>
              ) : (
                <>
                  <span>🤖</span>
                  <span>AI Review</span>
                </>
              )}
            </button>
          )}

          {/* Comments toggle — visible to everyone including share view */}
          {!isNew && (
            <button
              onClick={() => {
                setShowComments(!showComments)
                if (!showComments) setShowAIPanel(false)
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                showComments
                  ? 'bg-blue-500/10 border-blue-500/40 text-blue-400 shadow-lg shadow-blue-500/10'
                  : 'bg-[#1e293b] border-[#334155] text-gray-300 hover:text-white hover:border-blue-500/40'
              }`}
            >
              💬 Comments
            </button>
          )}

          {/* Share button — shown for authenticated owner */}
          {shareLink && !isShareView && (
            <button
              onClick={handleCopyShareLink}
              className="flex items-center gap-2 bg-[#1e293b] hover:bg-[#273449] border border-[#334155] text-gray-300 hover:text-white text-sm px-4 py-2.5 rounded-xl transition-all"
            >
              🔗 Share
            </button>
          )}

          {/* Save — only for new snippets by logged-in users */}
          {isNew && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-900/30"
            >
              {saving ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Saving...</span>
                </>
              ) : (
                'Save Snippet'
              )}
            </button>
          )}
        </div>
      </div>

      {/* Workspace */}
      <div className="flex-1 flex overflow-hidden bg-[#0b1120]">

        {/* Editor + Reactions */}
        <div className="flex-1 flex flex-col overflow-hidden">

          <div className="flex-1 overflow-hidden border-r border-[#1f2937]">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={(value) => setCode(value || '')}
              theme="vs-dark"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                automaticLayout: true,
                wordWrap: 'on',
                smoothScrolling: true,
                cursorSmoothCaretAnimation: 'on',
                padding: { top: 20 },
                // Code editing disabled for share view
                // but socket/comments/reactions still fully work
                readOnly: isShareView,
              }}
            />
          </div>

         {/* Reactions bar */}
{!isNew && snippet?.id && (
  <div className="bg-[#111827]/95 backdrop-blur-sm border-t border-[#1f2937] px-4 py-3 shrink-0">
    <ReactionsBar
      snippetId={snippet.id}
      socket={socketInstance}
    />
  </div>
)}
        </div>

        {/* Comments Panel */}
{!isNew && snippet?.id && showComments && !showAIPanel && (
  <div className="w-[340px] shrink-0 flex flex-col overflow-hidden border-l border-[#1f2937] bg-[#0f172a]">
    <CommentsPanel
      snippetId={snippet.id}
      socket={socketInstance}
      isReadOnly={false}
    />
  </div>
)}

        {/* AI Review Panel
            FIX: Panel is visible in share view to display existing analysis results.
            The trigger button is hidden for guests (handled in toolbar above).
            Guests can VIEW results but cannot trigger new analysis. */}
        {!isNew && showAIPanel && (
          <div className="w-[340px] shrink-0 flex flex-col overflow-hidden border-l border-[#1f2937] bg-[#0f172a]">
            <AIReviewPanel
              analysis={aiAnalysis}
              loading={aiLoading}
              error={aiError}
              onClose={handleCloseAI}
            />
          </div>
        )}

      </div>
    </div>
  )
}

export default EditorPage