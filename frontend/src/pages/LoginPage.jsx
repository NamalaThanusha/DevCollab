import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { loginUser } from '../api/auth.js'
import useAuth from '../hooks/useAuth.js'
import LoadingSpinner from '../components/LoadingSpinner.jsx'

const LoginPage = () => {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const { email, password } = formData

    if (!email || !password) {
      toast.error('Email and password are required')
      return
    }

    setLoading(true)

    try {
      const res = await loginUser({
        email,
        password,
      })

      login(
        res.data.token,
        res.data.user
      )

      toast.success(
        `Welcome back, ${res.data.user.username}!`
      )

      navigate('/dashboard')

    } catch (err) {

      console.error(err)

      const message =
        err.response?.data?.message ||
        err.message ||
        'Login failed'

      toast.error(message)

    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen auth-bg relative overflow-hidden flex items-center justify-center px-4">

      {/* Background glow */}
      <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-600/10 blur-3xl rounded-full pointer-events-none" />

      {/* Top back button */}
      <div className="absolute top-6 left-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#30363d] bg-[#161b22]/80 backdrop-blur-md text-gray-300 hover:text-white hover:border-blue-500 transition-all duration-200"
        >
          <span>←</span>
          <span className="text-sm font-medium">
            Back to home
          </span>
        </button>
      </div>

      <div className="w-full max-w-md relative z-10">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Dev<span className="gradient-text">Collab</span>
          </h1>

          <p className="text-gray-400 mt-3 text-sm">
            Real-time collaborative code review
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#161b22]/90 backdrop-blur-xl border border-[#30363d] rounded-2xl p-8 shadow-2xl shadow-black/40 fade-in hover:border-[#3b82f6]/40 transition-all duration-300">

          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-white">
              Sign in
            </h2>

            <p className="text-gray-400 text-sm mt-1">
              Continue your collaborative workspace
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Email */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="off"
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Password
              </label>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="your password"
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Signing in...</span>
                </>
              ) : (
                'Sign in'
              )}
            </button>

          </form>
        </div>

        {/* Bottom link */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-blue-500 hover:text-blue-400 transition-colors font-medium"
          >
            Create one
          </Link>
        </p>

      </div>
    </div>
  )
}

export default LoginPage