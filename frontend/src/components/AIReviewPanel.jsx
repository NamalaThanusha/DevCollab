import LoadingSpinner from './LoadingSpinner.jsx'

const Section = ({
  icon,
  title,
  items,
  colorClass,
  bgClass,
  borderClass,
}) => {
  if (!items || items.length === 0) return null

  return (
    <div
      className={`rounded-lg border ${borderClass} ${bgClass} p-4`}
    >
      <h4
        className={`text-sm font-semibold ${colorClass} mb-3 flex items-center gap-2`}
      >
        <span>{icon}</span>

        <span>{title}</span>

        <span
          className={`text-xs font-normal opacity-70`}
        >
          ({items.length})
        </span>
      </h4>

      <ul className="space-y-2">
        {items.map((item, index) => (
          <li
            key={index}
            className="flex items-start gap-2"
          >
            <span
              className={`text-xs mt-0.5 ${colorClass} opacity-60 shrink-0`}
            >
              •
            </span>

            <span className="text-gray-300 text-xs leading-relaxed">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

const AIReviewPanel = ({
  analysis,
  loading,
  onClose,
  error,
}) => {
  return (
    <div className="flex flex-col h-full bg-[#161b22] border-l border-[#30363d]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#30363d] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span>🤖</span>

          <h3 className="text-white text-sm font-semibold">
            AI Code Review
          </h3>
        </div>

        <button
          onClick={onClose}
          className="text-gray-500 hover:text-white transition-colors text-lg leading-none"
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <LoadingSpinner size="lg" />

            <div className="text-center">
              <p className="text-white text-sm font-medium">
                Analyzing your code...
              </p>

              <p className="text-gray-500 text-xs mt-1">
                This may take a few seconds
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <p className="text-red-400 text-sm font-medium mb-1">
              Analysis failed
            </p>

            <p className="text-gray-400 text-xs">
              {error}
            </p>
          </div>
        )}

        {/* Results */}
        {analysis && !loading && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span>📋</span>

                <h4 className="text-blue-400 text-sm font-semibold">
                  Summary
                </h4>
              </div>

              <p className="text-gray-300 text-xs leading-relaxed">
                {analysis.summary}
              </p>
            </div>

            {/* Bugs */}
            <Section
              icon="🐛"
              title="Bug Warnings"
              items={analysis.bugs}
              colorClass="text-red-400"
              bgClass="bg-red-500/5"
              borderClass="border-red-500/20"
            />

            {/* No bugs */}
            {analysis.bugs &&
              analysis.bugs.length === 0 && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                  <p className="text-green-400 text-xs flex items-center gap-2">
                    <span>✅</span>
                    No bugs detected
                  </p>
                </div>
              )}

            {/* Optimizations */}
            <Section
              icon="⚡"
              title="Optimizations"
              items={analysis.optimizations}
              colorClass="text-yellow-400"
              bgClass="bg-yellow-500/5"
              borderClass="border-yellow-500/20"
            />

            {/* Readability */}
            <Section
              icon="📖"
              title="Readability"
              items={analysis.readability}
              colorClass="text-purple-400"
              bgClass="bg-purple-500/5"
              borderClass="border-purple-500/20"
            />
          </div>
        )}

        {/* Empty state */}
        {!analysis && !loading && !error && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🤖</p>

            <p className="text-gray-400 text-sm font-medium">
              Ready to analyze
            </p>

            <p className="text-gray-600 text-xs mt-1">
              Click AI Review to start
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AIReviewPanel