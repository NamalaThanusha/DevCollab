import { Link, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth.js'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-[#161b22] border-b border-[#30363d] px-6 py-3 flex items-center justify-between sticky top-0 z-50">

      {/* Logo */}
      <Link to="/dashboard" className="text-white font-bold text-lg tracking-tight">
        Dev<span className="text-blue-500">Collab</span>
      </Link>

      {/* Right side */}
      {user && (
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/editor/new')}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
          >
            + New Snippet
          </button>

          <span className="text-gray-400 text-sm hidden sm:block">
            @{user.username}
          </span>

          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  )
}

export default Navbar