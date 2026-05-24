import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import Editor from '@monaco-editor/react'

import {
  createSnippet,
  getSnippetById,
  getSnippetByShareId,
} from '../api/snippets.js'

import useAuth from '../hooks/useAuth.js'
import Navbar from '../components/Navbar.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'

import {
  LANGUAGES,
  DEFAULT_CODE,
} from '../constants.js'

const EditorPage = () => {
  const { id, shareId } = useParams()

  const navigate = useNavigate()

  const { user } = useAuth()

  // Shared view?
  const isShareView = Boolean(shareId)

  // New snippet?
  const isNew = id === 'new'

  const [snippet, setSnippet] =
    useState(null)

  const [title, setTitle] =
    useState('')

  const [code, setCode] =
    useState(DEFAULT_CODE.javascript)

  const [language, setLanguage] =
    useState('javascript')

  const [loading, setLoading] =
    useState(!isNew)

  const [saving, setSaving] =
    useState(false)

  const [shareLink, setShareLink] =
    useState('')

  // Load snippet if NOT new
  useEffect(() => {
    if (isNew) return

    const loadSnippet = async () => {
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
        toast.error(
          'Snippet not found'
        )

        navigate('/dashboard')
      } finally {
        setLoading(false)
      }
    }

    loadSnippet()
  }, [
    id,
    shareId,
    isNew,
    isShareView,
    navigate,
  ])

  // Change language
  const handleLanguageChange = (
    newLanguage
  ) => {
    setLanguage(newLanguage)

    if (isNew) {
      setCode(
        DEFAULT_CODE[newLanguage] ||
          DEFAULT_CODE.default
      )
    }
  }

  // Save snippet
  const handleSave = async () => {
    if (!title.trim()) {
      toast.error(
        'Please enter a title'
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

      const newSnippet =
        res.data.snippet

      toast.success(
        'Snippet saved!'
      )

      navigate(
        `/editor/${newSnippet.id}`,
        {
          replace: true,
        }
      )
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Failed to save snippet'

      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  // Copy share link
  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(
      shareLink
    )

    toast.success(
      'Share link copied!'
    )
  }

  // Current user author?
  const isAuthor =
    user &&
    snippet &&
    snippet.author.id === user.id

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col">

      {/* Navbar */}
      {!isShareView && <Navbar />}

      {/* Share banner */}
      {isShareView && (
        <div className="bg-[#161b22] border-b border-[#30363d] px-6 py-3 flex items-center justify-between">

          <span className="text-white font-semibold text-lg">
            Dev
            <span className="text-blue-500">
              Collab
            </span>
          </span>

          <div className="flex items-center gap-3">

            <span className="text-gray-400 text-sm">
              Shared by{' '}
              <span className="text-white">
                @{snippet?.author.username}
              </span>
            </span>

            {!user && (
              <button
                onClick={() =>
                  navigate('/register')
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
      <div className="bg-[#161b22] border-b border-[#30363d] px-6 py-3 flex items-center gap-4">

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
            className="flex-1 bg-transparent text-white placeholder-gray-600 text-sm font-medium focus:outline-none"
          />
        ) : (
          <h2 className="flex-1 text-white text-sm font-medium truncate">
            {title}
          </h2>
        )}

        {/* Language */}
        <select
          value={language}
          onChange={(e) =>
            handleLanguageChange(
              e.target.value
            )
          }
          disabled={isShareView}
          className="bg-[#21262d] border border-[#30363d] text-gray-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
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

        {/* Share button */}
        {shareLink && (
          <button
            onClick={
              handleCopyShareLink
            }
            className="flex items-center gap-2 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-gray-300 text-sm px-3 py-1.5 rounded-lg transition-colors"
          >
            🔗 Share
          </button>
        )}

        {/* Save button */}
        {isNew && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
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

      {/* Monaco Editor */}
      <div className="flex-1">

        <Editor
          height="calc(100vh - 120px)"
          language={language}
          value={code}
          onChange={(value) =>
            setCode(value || '')
          }
          theme="vs-dark"
          options={{
            fontSize: 14,

            fontFamily:
              "'JetBrains Mono', 'Fira Code', monospace",

            fontLigatures: true,

            minimap: {
              enabled: false,
            },

            scrollBeyondLastLine: false,

            lineNumbers: 'on',

            roundedSelection: true,

            cursorStyle: 'line',

            automaticLayout: true,

            tabSize: 2,

            wordWrap: 'on',

            padding: {
              top: 16,
              bottom: 16,
            },

            readOnly: isShareView,

            smoothScrolling: true,

            cursorBlinking: 'smooth',
          }}
        />

      </div>

    </div>
  )
}

export default EditorPage