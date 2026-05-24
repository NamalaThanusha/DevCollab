// frontend/src/components/LoadingSpinner.jsx
const LoadingSpinner = ({ size = 'md' }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-[3px]',
  }

  return (
    <div className="flex items-center justify-center">
      <div className={`${sizes[size]} border-dark-600 border-t-blue-500 rounded-full animate-spin`} />
    </div>
  )
}

export default LoadingSpinner