import type { ReactNode } from 'react'

type CommonProps = {
  className?: string
  children?: ReactNode
}

function cx(...classes: Array<string | undefined | false>): string {
  return classes.filter(Boolean).join(' ')
}

export function AppBar({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <header className="app-bar">
      <div className="app-title">{title}</div>
      <div className="app-actions">{right}</div>
    </header>
  )
}

export function Section({ title, subtitle, children }: {
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <section className="section">
      <div className="section-title">{title}</div>
      {subtitle ? <div className="section-subtitle">{subtitle}</div> : null}
      {children}
    </section>
  )
}

export function Card({ className, children }: CommonProps) {
  return <div className={cx('card', className)}>{children}</div>
}

export function Chip({
  active,
  className,
  children,
  ...props
}: CommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      {...props}
      className={cx('chip', active && 'chip-active', className)}
    >
      {children}
    </button>
  )
}

export function Badge({
  className,
  children,
  ...props
}: CommonProps & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span {...props} className={cx('badge', className)}>
      {children}
    </span>
  )
}

type StatusBannerProps = {
  icon?: string
  variant?: 'default' | 'warning' | 'error'
  children: ReactNode
}

export function StatusBanner({ icon, variant = 'default', children }: StatusBannerProps) {
  const variantClass =
    variant === 'warning'
      ? 'status-banner status-banner-warning'
      : variant === 'error'
        ? 'status-banner status-banner-error'
        : 'status-banner'
  const bannerRole = variant === 'error' ? 'alert' : 'status'
  return (
    <div className={variantClass} role={bannerRole}>
      {icon ? <div className="status-banner-icon">{icon}</div> : null}
      <div>{children}</div>
    </div>
  )
}

type ContextRow = {
  label: string
  value: string
}

export function ContextCard({
  rows,
  className,
}: {
  rows: ContextRow[]
  className?: string
}) {
  return (
    <div className={cx('card context-card', className)} role="region" aria-label="Контекст заказа">
      {rows.map((row, index) => (
        <div key={`${row.label}-${index}`}>
          <div className="context-row">
            <span className="context-label">{row.label}</span>
            <span className="context-value">{row.value}</span>
          </div>
          {index < rows.length - 1 ? <div className="context-divider" /> : null}
        </div>
      ))}
    </div>
  )
}

type StepTabItem = {
  id: string
  label: string
  disabled?: boolean
  visited?: boolean
}

export function StepTabs({
  items,
  activeId,
  onSelect,
}: {
  items: StepTabItem[]
  activeId: string
  onSelect: (id: string) => void
}) {
  return (
    <div className="step-tabs">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={cx(
            'step-tab',
            item.visited && 'step-tab-visited',
            activeId === item.id && 'step-tab-active',
          )}
          onClick={() => onSelect(item.id)}
          disabled={item.disabled}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

type BottomNavItem = {
  id: string
  label: string
  icon: string
  disabled?: boolean
  visited?: boolean
}

export function BottomNav({
  items,
  activeId,
  onSelect,
}: {
  items: BottomNavItem[]
  activeId: string
  onSelect: (id: string) => void
}) {
  return (
    <nav className="bottom-nav" aria-label="Навигация">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={cx(
            'bottom-nav-item',
            activeId === item.id && 'bottom-nav-item-active',
            item.visited && 'bottom-nav-item-visited',
          )}
          onClick={() => onSelect(item.id)}
          disabled={item.disabled}
          aria-current={activeId === item.id ? 'page' : undefined}
        >
          <span className="bottom-nav-icon">{item.icon}</span>
          <span className="bottom-nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  )
}

type ConfirmDialogProps = {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Подтвердить',
  cancelLabel = 'Отмена',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div
      className="dialog-overlay"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="dialog-card" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-title">{title}</div>
        <div className="dialog-message">{message}</div>
        <div className="dialog-actions">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className="btn" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export function Stepper({
  value,
  onDecrease,
  onIncrease,
}: {
  value: number
  onDecrease: () => void
  onIncrease: () => void
}) {
  return (
    <div className="stepper" role="group" aria-label="Количество">
      <button
        type="button"
        onClick={onDecrease}
        className="stepper-btn"
        aria-label="Уменьшить количество"
      >
        –
      </button>
      <span className="stepper-value" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={onIncrease}
        className="stepper-btn"
        aria-label="Увеличить количество"
      >
        +
      </button>
    </div>
  )
}
