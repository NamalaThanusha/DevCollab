import { useState, useEffect, useMemo } from 'react'
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

  const isShareView = Boolean(shareId)

  const isNew = id === 'new'

  const snippetRoomId = isShareView
    ? shareId
    : id

  // Stable socket instance
  const socket = useMemo(() => {
    if (isNew || !snippetRoomId)
      return null

    return io(
      'http://localhost:5000',
      {
        transports: [
          'websocket',
          'polling',
        ],
      }
    )
  }, [isNew, snippetRoomId])

  // Snippet states
  const [snippet, setSnippet] =
    useState(null)

  const [title, setTitle] =
    useState('')

  const [code, setCode] = useState(
    DEFAULT_CODE.javascript
  )

  const [language, setLanguage] =
    useState('javascript')

  // UI states
  const [loading, setLoading] =
    useState(!isNew)

  const [saving, setSaving] =
    useState(false)

  const [shareLink, setShareLink] =
    useState('')

  const [viewerCount, setViewerCount] =
    useState(1)

  // Panel states
  const [showComments, setShowComments] =
    useState(true)

  const [showAIPanel, setShowAIPanel] =
    useState(false)

  // AI states
  const [aiAnalysis, setAiAnalysis] =
    useState(null)

  const [aiLoading, setAiLoading] =
    useState(false)

  const [aiError, setAiError] =
    useState(null)

  // Load snippet
  useEffect(() => {
    if (isNew) return

    const fetchSnippet = async () => {
      try {
        let res

        if (isShareView) {
          res =
            await getSnippetByShareId(
              shareId
            )
        } else {
          res =
            await getSnippetById(id)
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
  }, [
    id,
    shareId,
    isNew,
    isShareView,
    navigate,
  ])

  // Socket listeners
  useEffect(() => {
    if (!socket || !snippetRoomId)
      return

    socket.on('connect', () => {
      socket.emit('join-snippet', {
        snippetId: snippetRoomId,

        username:
          user?.username || 'Guest',
      })
    })

    socket.on(
      'viewer-count',
      ({ count }) => {
        setViewerCount(count)
      }
    )

    return () => {
      socket.emit('leave-snippet', {
        snippetId: snippetRoomId,
      })

      socket.disconnect()
    }
  }, [
    socket,
    snippetRoomId,
    user?.username,
  ])

  const handleLanguageChange = (
    newLang
  ) => {
    setLanguage(newLang)

    if (isNew) {
      setCode(
        DEFAULT_CODE[newLang] ||
          DEFAULT_CODE.default
      )
    }
  }

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error(
        'Please add a title'
      )

      return
    }

    if (!code.trim()) {
      toast.error(
        'Code cannot be empty'
      )

      return
    }

    setSaving(true)

    try {
      const res =
        await createSnippet({
          title: title.trim(),
          code,
          language,
        })

      toast.success(
        'Snippet saved!'
      )

      navigate(
        `/editor/${res.data.snippet.id}`,
        {
          replace: true,
        }
      )
    } catch (err) {
      toast.error(
        err.response?.data
          ?.message ||
          'Failed to save'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleCopyShareLink =
    () => {
      navigator.clipboard.writeText(
        shareLink
      )

      toast.success(
        'Share link copied!'
      )
    }

  // AI review
  const handleAIReview =
    async () => {
      if (!code.trim()) {
        toast.error(
          'No code to analyze'
        )

        return
      }

      setShowAIPanel(true)

      setShowComments(false)

      setAiAnalysis(null)

      setAiError(null)

      setAiLoading(true)

      try {
        const res =
          await analyzeCode({
            code,
            language,
          })

        setAiAnalysis(
          res.data.analysis
        )
      } catch (err) {
        const message =
          err.response?.data
            ?.message ||
          'AI analysis failed.'

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

  const isAuthor =
    user &&
    snippet &&
    snippet.author.id === user.id

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="h-screen bg-[#0d1117] flex flex-col overflow-hidden">
      {/* Navbar */}
      {!isShareView && <Navbar />}

      {/* Share bar */}
      {isShareView && (
        <div className="bg-[#161b22] border-b border-[#30363d] px-6 py-3 flex items-center justify-between shrink-0">
          <span className="text-white font-bold text-lg">
            Dev
            <span className="text-blue-500">
              Collab
            </span>
          </span>

          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-sm">
              by{' '}
              <span className="text-white">
                @{snippet?.author.username}
              </span>
            </span>

            {!user && (
              <button
                onClick={() =>
                  navigate(
                    '/register'
                  )
                }
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
              >
                Sign up free
              </button>
            )}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-[#161b22] border-b border-[#30363d] px-4 py-2.5 flex items-center gap-3 shrink-0 overflow-x-auto">
        {/* Title */}
        {(isNew || isAuthor) &&
        !isShareView ? (
          <input
            type="text"
            value={title}
            onChange={(e) =>
              setTitle(
                e.target.value
              )
            }
            placeholder="Snippet title..."
            className="flex-1 bg-transparent text-white placeholder-gray-600 text-sm font-medium focus:outline-none min-w-0"
          />
        ) : (
          <h2 className="flex-1 text-white text-sm font-medium truncate min-w-0">
            {title}
          </h2>
        )}

        {/* Viewers */}
        {!isNew && (
          <div className="flex items-center gap-1.5 text-gray-500 text-xs shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />

            <span>
              {viewerCount} viewing
            </span>
          </div>
        )}

        {/* Language */}
        <select
          value={language}
          onChange={(e) =>
            handleLanguageChange(
              e.target.value
            )
          }
          disabled={
            isShareView ||
            (!isNew && !isAuthor)
          }
          className="bg-[#21262d] border border-[#30363d] text-gray-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 disabled:opacity-60 shrink-0"
        >
          {LANGUAGES.map((lang) => (
            <option
              key={lang.value}
              value={lang.value}
            >
              {lang.label}
            </option>
          ))}
        </select>

        {/* AI button */}
        {!isNew && user && (
          <button
            onClick={
              handleAIReview
            }
            disabled={aiLoading}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-colors shrink-0 ${
              showAIPanel
                ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                : 'bg-[#21262d] border-[#30363d] text-gray-300 hover:text-white hover:border-[#484f58]'
            }`}
          >
            {aiLoading ? (
              <>
                <LoadingSpinner size="sm" />

                <span>
                  Analyzing...
                </span>
              </>
            ) : (
              <>
                <span>🤖</span>

                <span>
                  AI Review
                </span>
              </>
            )}
          </button>
        )}

        {/* Comments */}
        {!isNew && (
          <button
            onClick={() => {
              setShowComments(
                !showComments
              )

              if (!showComments) {
                setShowAIPanel(false)
              }
            }}
            className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors shrink-0 ${
              showComments
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                : 'bg-[#21262d] border-[#30363d] text-gray-400 hover:text-white'
            }`}
          >
            💬 Comments
          </button>
        )}

        {/* Share */}
        {shareLink && (
          <button
            onClick={
              handleCopyShareLink
            }
            className="flex items-center gap-1.5 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-gray-300 text-xs px-2.5 py-1.5 rounded-lg transition-colors shrink-0"
          >
            🔗 Share
          </button>
        )}

        {/* Save */}
        {isNew && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors shrink-0"
          >
            {saving ? (
              <>
                <LoadingSpinner size="sm" />

                <span>
                  Saving...
                </span>
              </>
            ) : (
              'Save Snippet'
            )}
          </button>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={(value) =>
                setCode(value || '')
              }
              theme="vs-dark"
              options={{
                fontSize: 14,

                minimap: {
                  enabled: false,
                },

                automaticLayout: true,

                wordWrap: 'on',

                readOnly:
                  isShareView,
              }}
            />
          </div>

          {/* Reactions */}
          {!isNew && (
            <div className="bg-[#161b22] border-t border-[#30363d] px-4 py-2.5 shrink-0">
              <ReactionsBar
                snippetId={
                  snippetRoomId
                }
                socket={socket}
              />
            </div>
          )}
        </div>

        {/* Comments */}
        {!isNew &&
          showComments &&
          !showAIPanel && (
            <div className="w-80 shrink-0 flex flex-col overflow-hidden">
              <CommentsPanel
                snippetId={
                  snippetRoomId
                }
                socket={socket}
                isReadOnly={
                  isShareView
                }
              />
            </div>
          )}

        {/* AI panel */}
        {!isNew &&
          showAIPanel && (
            <div className="w-80 shrink-0 flex flex-col overflow-hidden">
              <AIReviewPanel
                analysis={
                  aiAnalysis
                }
                loading={aiLoading}
                error={aiError}
                onClose={
                  handleCloseAI
                }
              />
            </div>
          )}
      </div>
    </div>
  )
}

export default EditorPage