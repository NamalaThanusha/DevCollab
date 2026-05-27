import { useNavigate } from 'react-router-dom'

const NotFoundPage = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-6">
      <div className="text-center fade-in">
        <p className="text-8xl font-bold text-[#21262d] mb-4 select-none">404</p>
        <h1 className="text-white text-xl font-semibold mb-2">Page not found</h1>
        <p className="text-gray-500 text-sm mb-8 max-w-xs mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-gray-300 text-sm px-4 py-2 rounded-lg transition-colors"
          >
            ← Go back
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage