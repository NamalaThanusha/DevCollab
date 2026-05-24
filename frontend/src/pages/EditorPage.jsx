import {
  useState,
  useEffect,
  useRef,
} from 'react'

import {
  useParams,
  useNavigate,
} from 'react-router-dom'

import { toast } from 'react-hot-toast'

import Editor from '@monaco-editor/react'

import { io } from 'socket.io-client'

import {
  createSnippet,
  getSnippetById,
  getSnippetByShareId,
} from '../api/snippets.js'

import useAuth from '../hooks/useAuth.js'

import Navbar from '../components/Navbar.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import CommentsPanel from '../components/CommentsPanel.jsx'
import ReactionsBar from '../components/ReactionsBar.jsx'

import {
  LANGUAGES,
  DEFAULT_CODE,
} from '../constants.js'

const EditorPage = () => {

  const { id, shareId } =
    useParams()

  const navigate =
    useNavigate()

  const { user } =
    useAuth()

  const socketRef =
    useRef(null)

  const isShareView =
    Boolean(shareId)

  const isNew =
    id === 'new'

  const [snippet, setSnippet] =
    useState(null)

  const [title, setTitle] =
    useState('')

  const [code, setCode] =
    useState(
      DEFAULT_CODE.javascript
    )

  const [language, setLanguage] =
    useState('javascript')

  const [loading, setLoading] =
    useState(!isNew)

  const [saving, setSaving] =
    useState(false)

  const [shareLink, setShareLink] =
    useState('')

  const [viewerCount, setViewerCount] =
    useState(1)

  const [showComments, setShowComments] =
    useState(true)

  const [socketConnected, setSocketConnected] =
    useState(false)

  const [socket, setSocket] =
    useState(null)

  // IMPORTANT FIX
  const snippetRoomId =
    snippet?.id || id

  // LOAD SNIPPET
  useEffect(() => {

    if (isNew) return

    const loadSnippet =
      async () => {

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

          const s =
            res.data.snippet

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

  // SOCKET
  useEffect(() => {

    if (
      isNew ||
      !snippetRoomId
    ) {
      return
    }

    const newSocket = io(
      'http://localhost:5000',
      {
        transports: [
          'websocket',
          'polling',
        ],
      }
    )

    socketRef.current =
      newSocket

    Promise.resolve().then(() => {
      setSocket(newSocket)
    })

    newSocket.on(
      'connect',
      () => {

        console.log(
          '[Socket Connected]',
          newSocket.id
        )

        newSocket.emit(
          'join-snippet',
          {
            snippetId:
              snippetRoomId,

            username:
              user?.username ||
              'Guest',
          }
        )

        setSocketConnected(true)
      }
    )

    newSocket.on(
      'viewer-count',
      ({ count }) => {

        setViewerCount(count)
      }
    )

    return () => {

      newSocket.emit(
        'leave-snippet',
        {
          snippetId:
            snippetRoomId,
        }
      )

      newSocket.disconnect()

      socketRef.current =
        null

      setSocket(null)

      setSocketConnected(false)
    }

  }, [
    isNew,
    snippetRoomId,
    user?.username,
  ])

  // LANGUAGE
  const handleLanguageChange =
    (newLang) => {

      setLanguage(newLang)

      if (isNew) {

        setCode(
          DEFAULT_CODE[
            newLang
          ] ||
          DEFAULT_CODE.default
        )
      }
    }

  // SAVE
  const handleSave =
    async () => {

      if (
        !title.trim()
      ) {

        toast.error(
          'Please add a title'
        )

        return
      }

      if (
        !code.trim()
      ) {

        toast.error(
          'Code cannot be empty'
        )

        return
      }

      setSaving(true)

      try {

        const res =
          await createSnippet({
            title:
              title.trim(),
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

  // SHARE
  const handleCopyShareLink =
    () => {

      navigator.clipboard.writeText(
        shareLink
      )

      toast.success(
        'Share link copied!'
      )
    }

  const isAuthor =
    user &&
    snippet &&
    snippet.author.id ===
      user.id

  if (loading) {

    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="h-screen bg-[#0d1117] flex flex-col overflow-hidden">

      {!isShareView && (
        <Navbar />
      )}

      {/* TOPBAR */}
      <div className="bg-[#161b22] border-b border-[#30363d] px-4 py-2.5 flex items-center gap-3 shrink-0">

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

        {!isNew && (

          <div className="flex items-center gap-1.5 text-gray-500 text-xs">

            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />

            <span>
              {viewerCount} viewing
            </span>

          </div>
        )}

        <select
          value={language}
          onChange={(e) =>
            handleLanguageChange(
              e.target.value
            )
          }
          className="bg-[#21262d] border border-[#30363d] text-gray-300 text-xs rounded-lg px-2.5 py-1.5"
        >

          {LANGUAGES.map(
            (lang) => (

              <option
                key={lang.value}
                value={lang.value}
              >
                {lang.label}
              </option>
            )
          )}

        </select>

        {!isNew && (

          <button
            onClick={() =>
              setShowComments(
                !showComments
              )
            }
            className="text-xs px-2.5 py-1.5 rounded-lg border"
          >
            💬 Comments
          </button>
        )}

        {shareLink && (

          <button
            onClick={
              handleCopyShareLink
            }
            className="text-xs px-2.5 py-1.5 rounded-lg border"
          >
            🔗 Share
          </button>
        )}

        {isNew && (

          <button
            onClick={
              handleSave
            }
            disabled={saving}
            className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg"
          >
            {saving
              ? 'Saving...'
              : 'Save Snippet'}
          </button>
        )}

      </div>

      {/* MAIN */}
      <div className="flex-1 flex overflow-hidden">

        {/* EDITOR */}
        <div className="flex-1 flex flex-col overflow-hidden">

          <div className="flex-1">

            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={(value) =>
                setCode(
                  value || ''
                )
              }
              theme="vs-dark"
              options={{
                automaticLayout: true,
                minimap: {
                  enabled: false,
                },
                readOnly:
                  isShareView,
              }}
            />

          </div>

          {!isNew &&
            socketConnected &&
            socket && (

              <div className="bg-[#161b22] border-t border-[#30363d] px-4 py-2.5">

                <ReactionsBar
                  snippetId={
                    snippetRoomId
                  }
                  socket={socket}
                />

              </div>
            )}

        </div>

        {/* COMMENTS */}
        {!isNew &&
          showComments &&
          socketConnected &&
          socket && (

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

      </div>

    </div>
  )
}

export default EditorPage