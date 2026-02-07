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
  return (
    <div className={variantClass}>
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
    <div className="stepper">
      <button type="button" onClick={onDecrease} className="stepper-btn">
        –
      </button>
      <span className="stepper-value">{value}</span>
      <button type="button" onClick={onIncrease} className="stepper-btn">
        +
      </button>
    </div>
  )
}
