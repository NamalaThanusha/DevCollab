// frontend/src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth.js'
import LoadingSpinner from './LoadingSpinner.jsx'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d1117]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute