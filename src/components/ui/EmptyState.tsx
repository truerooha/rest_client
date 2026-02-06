import { ReactNode } from 'react'
import { PrimaryButton } from './Button'

type EmptyStateProps = {
  emoji?: string
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  children?: ReactNode
}

export function EmptyState({ emoji, title, description, action, children }: EmptyStateProps) {
  return (
    <div className="empty-state">
      {emoji ? <div className="empty-state-emoji">{emoji}</div> : null}
      <div className="empty-state-title">{title}</div>
      {description ? <div className="empty-state-description">{description}</div> : null}
      {action ? (
        <PrimaryButton type="button" onClick={action.onClick}>
          {action.label}
        </PrimaryButton>
      ) : null}
      {children}
    </div>
  )
}
