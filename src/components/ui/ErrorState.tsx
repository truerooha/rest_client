import { SecondaryButton } from './Button'

type ErrorStateProps = {
  title?: string
  message: string
  onRetry?: () => void
}

export function ErrorState({ title = 'Что-то пошло не так', message, onRetry }: ErrorStateProps) {
  return (
    <div className="error-state">
      <div className="error-state-emoji">⚠️</div>
      <div className="error-state-title">{title}</div>
      <div className="error-state-message">{message}</div>
      {onRetry ? (
        <SecondaryButton type="button" onClick={onRetry}>
          Попробовать снова
        </SecondaryButton>
      ) : null}
    </div>
  )
}
