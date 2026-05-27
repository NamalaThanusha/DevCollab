import { Link, useLocation, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth.js'

const Navbar = () => {
  const { user, logout } = useAuth()

  const navigate = useNavigate()
  const location = useLocation()

  const isEditorPage =
    location.pathname.includes('/editor')

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-[#30363d] bg-[#161b22]/90 backdrop-blur-xl">

      <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between">

        {/* LEFT */}
        <div className="flex items-center gap-4">

       {/* Back Button */}
{isEditorPage && (
  <button
    onClick={() =>
      navigate('/dashboard')
    }
    className="hidden sm:flex items-center gap-2 bg-[#0d1117] border border-[#30363d] hover:border-blue-500/40 hover:bg-[#161b22] text-gray-300 hover:text-white text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200"
  >
    <span className="text-base leading-none">
      ←
    </span>

    Back
  </button>
)}

          {/* Logo */}
          <Link
            to="/dashboard"
            className="group text-xl font-bold tracking-tight text-white flex items-center"
          >
            <span className="transition-transform duration-300 group-hover:scale-105">
              Dev
            </span>

            <span className="gradient-text transition-all duration-300 group-hover:brightness-125">
              Collab
            </span>
          </Link>

        </div>

        {/* RIGHT */}
        {user && (
          <div className="flex items-center gap-3">

            {/* New Snippet */}
            <button
              onClick={() =>
                navigate('/editor/new')
              }
              className="hidden sm:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-blue-500/10"
            >
              <span className="text-base leading-none">
                +
              </span>

              New Snippet
            </button>

            {/* Username */}
            <div className="hidden md:flex items-center gap-2 bg-[#0d1117] border border-[#30363d] rounded-xl px-3 py-2">

              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-semibold text-white">
                {user.username?.charAt(0)?.toUpperCase()}
              </div>

              <span className="text-sm text-gray-300">
                @{user.username}
              </span>

            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 px-3 py-2 rounded-lg transition-all duration-200"
            >
              Logout
            </button>

          </div>
        )}

      </div>

    </nav>
  )
}

export default Navbar