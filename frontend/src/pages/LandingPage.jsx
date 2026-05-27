import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import useAuth from '../hooks/useAuth.js'

const LandingPage = () => {
  const navigate = useNavigate()

  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard')
    }
  }, [user, loading, navigate])

  const features = [
    {
      icon: '⚡',
      title: 'Real-Time Collaboration',
      desc: 'Comments and reactions sync instantly across all viewers.',
    },
    {
      icon: '🤖',
      title: 'AI Code Review',
      desc: 'Get bug warnings, optimization tips, and readability feedback.',
    },
    {
      icon: '🎨',
      title: 'Monaco Editor',
      desc: 'The same editor powering VS Code, right in your browser.',
    },
    {
      icon: '🔗',
      title: 'Instant Sharing',
      desc: 'Share any snippet with a link. No account needed to view.',
    },
    {
      icon: '💬',
      title: 'Inline Comments',
      desc: 'Comment on specific line numbers like a real code review.',
    },
    {
      icon: '✨',
      title: 'Emoji Reactions',
      desc: 'React to code with emojis. Updates live for all viewers.',
    },
  ]

  return (
    <div className="min-h-screen bg-[#0b1120] text-white relative overflow-hidden">

      {/* Background glow */}
      <div className="hero-glow" />

      {/* Navbar */}
      <nav className="border-b border-[#30363d]/70 bg-[#0d1117]/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <span className="text-lg">⚡</span>
            </div>

            <span className="text-white font-bold text-2xl tracking-tight">
              Dev<span className="gradient-text">Collab</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="text-gray-400 hover:text-white text-sm transition-colors px-4 py-2 rounded-xl"
            >
              Sign in
            </button>

            <button
              onClick={() => navigate('/register')}
              className="bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/20 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
            >
              Get started free
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-6 pt-28 pb-24 text-center">

        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-5 py-2 text-blue-300 text-xs font-medium mb-10 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          Real-time collaborative code review
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-8 max-w-6xl mx-auto">
          Review code together,
          <br />
          <span className="gradient-text">
            in real time
          </span>
        </h1>

        <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto mb-12 leading-relaxed">
          DevCollab combines a VS Code-powered editor with live comments,
          emoji reactions, and AI-powered code review.
          Built for developers who collaborate faster.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">

          <button
            onClick={() => navigate('/register')}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-500/20 text-white font-semibold px-9 py-4 rounded-xl transition-all text-sm"
          >
            Start for free →
          </button>

          <button
            onClick={() => navigate('/login')}
            className="w-full sm:w-auto glass-card hover:border-[#484f58] text-gray-300 font-medium px-9 py-4 rounded-xl transition-all text-sm"
          >
            Sign in
          </button>
        </div>

        <p className="text-gray-600 text-xs">
          No credit card required · Free to use
        </p>
      </section>

      {/* Editor preview */}
      <section className="relative max-w-6xl mx-auto px-6 pb-28">

        <div className="glass-card premium-shadow rounded-2xl overflow-hidden glow-hover">

          {/* Top bar */}
          <div className="bg-[#1b2230]/80 border-b border-[#30363d] px-5 py-4 flex items-center gap-3">

            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
            </div>

            <span className="text-gray-500 text-xs flex-1 text-center">
              bubble-sort.js — DevCollab
            </span>

            <span className="bg-yellow-500/10 text-yellow-400 text-xs px-2.5 py-1 rounded-lg border border-yellow-500/20">
              JavaScript
            </span>
          </div>

          <div className="flex flex-col lg:flex-row">

            {/* Code area */}
            <div className="flex-1 p-7 font-mono text-sm overflow-x-auto">

              <div className="space-y-1">
                {[
                  { ln: 1, code: 'function bubbleSort(arr) {', color: 'text-blue-400' },
                  { ln: 2, code: '  const n = arr.length', color: 'text-gray-300' },
                  { ln: 3, code: '  for (let i = 0; i < n; i++) {', color: 'text-purple-400' },
                  { ln: 4, code: '    for (let j = 0; j < n-i; j++) {', color: 'text-purple-400' },
                  { ln: 5, code: '      if (arr[j] > arr[j+1]) {', color: 'text-yellow-400' },
                  { ln: 6, code: '        let temp = arr[j]', color: 'text-gray-300' },
                  { ln: 7, code: '        arr[j] = arr[j+1]', color: 'text-gray-300' },
                  { ln: 8, code: '        arr[j+1] = temp', color: 'text-gray-300' },
                  { ln: 9, code: '      }', color: 'text-yellow-400' },
                  { ln: 10, code: '    }', color: 'text-purple-400' },
                  { ln: 11, code: '  }', color: 'text-purple-400' },
                  { ln: 12, code: '  return arr', color: 'text-green-400' },
                  { ln: 13, code: '}', color: 'text-blue-400' },
                ].map(({ ln, code, color }) => (
                  <div key={ln} className="flex gap-5">
                    <span className="text-gray-600 w-5 text-right shrink-0 select-none">
                      {ln}
                    </span>

                    <span className={color}>
                      {code}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Comments preview */}
            <div className="w-full lg:w-72 border-l border-[#30363d] bg-[#0d1117]/40 p-5 space-y-4">

              <div className="flex items-center justify-between">
                <p className="text-white text-sm font-semibold">
                  Comments
                </p>

                <span className="text-gray-500 text-xs">
                  2 active
                </span>
              </div>

              {[
                {
                  user: 'alex',
                  line: 5,
                  text: 'Use a swap helper here',
                },
                {
                  user: 'priya',
                  line: 3,
                  text: 'Add early exit condition',
                },
              ].map((c, i) => (
                <div
                  key={i}
                  className="bg-[#111827]/90 rounded-xl p-3 border border-[#30363d]"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-blue-400 text-xs font-medium">
                      @{c.user}
                    </span>

                    <span className="bg-[#21262d] text-gray-500 text-[10px] px-1.5 py-0.5 rounded">
                      L{c.line}
                    </span>
                  </div>

                  <p className="text-gray-400 text-xs leading-relaxed">
                    {c.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Reactions */}
          <div className="border-t border-[#30363d] px-6 py-4 flex items-center gap-2 flex-wrap">

            {[
              {
                emoji: '👍',
                count: 3,
                active: true,
              },
              {
                emoji: '🔥',
                count: 2,
                active: false,
              },
              {
                emoji: '💡',
                count: 1,
                active: false,
              },
            ].map((r) => (
              <span
                key={r.emoji}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs border transition-all ${
                  r.active
                    ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                    : 'bg-[#21262d] border-[#30363d] text-gray-400'
                }`}
              >
                {r.emoji} {r.count}
              </span>
            ))}

            <span className="text-gray-500 text-xs ml-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              3 viewing now
            </span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative max-w-7xl mx-auto px-6 py-24 border-t border-[#21262d]/70">

        <div className="text-center mb-16">

          <h2 className="text-4xl font-bold text-white mb-4">
            Everything for better code reviews
          </h2>

          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Designed for modern developer workflows with realtime collaboration at the core.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

          {features.map((f) => (
            <div
              key={f.title}
              className="glass-card rounded-2xl p-7 glow-hover"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-2xl mb-5">
                {f.icon}
              </div>

              <h3 className="text-white font-semibold text-lg mb-3">
                {f.title}
              </h3>

              <p className="text-gray-500 text-sm leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative max-w-5xl mx-auto px-6 py-24 text-center">

        <div className="glass-card premium-shadow rounded-3xl px-8 py-16">

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Ready to collaborate
            <br />
            <span className="gradient-text">
              like a real team?
            </span>
          </h2>

          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Create your free account and start reviewing code with realtime collaboration,
            comments, reactions, and AI insights.
          </p>

          <button
            onClick={() => navigate('/register')}
            className="bg-blue-600 hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-500/20 text-white font-semibold px-10 py-4 rounded-xl transition-all text-sm"
          >
            Get started for free →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#21262d]/70 py-10">

        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-5">

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              ⚡
            </div>

            <span className="text-white font-bold text-lg">
              Dev<span className="gradient-text">Collab</span>
            </span>
          </div>

          <p className="text-gray-600 text-sm text-center">
            Built with React · Node.js · Socket.io · Prisma · OpenRouter AI
          </p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage