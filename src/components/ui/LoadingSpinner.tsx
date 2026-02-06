export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'spinner-sm',
    md: 'spinner-md',
    lg: 'spinner-lg',
  }
  
  return (
    <div className={`spinner ${sizeClasses[size]}`}>
      <div className="spinner-circle" />
    </div>
  )
}
