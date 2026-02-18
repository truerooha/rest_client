import type { ReactNode, SVGProps } from 'react'

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
  iconAccent?: boolean
  variant?: 'default' | 'warning' | 'error'
  children: ReactNode
}

export function StatusBanner({ icon, iconAccent, variant = 'default', children }: StatusBannerProps) {
  const variantClass =
    variant === 'warning'
      ? 'status-banner status-banner-warning'
      : variant === 'error'
        ? 'status-banner status-banner-error'
        : 'status-banner'
  const bannerRole = variant === 'error' ? 'alert' : 'status'
  return (
    <div className={variantClass} role={bannerRole}>
      {icon ? <div className={cx('status-banner-icon', iconAccent && 'status-banner-icon-accent')}>{icon}</div> : null}
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

const iconProps: SVGProps<SVGSVGElement> = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export const NavIcons = {
  home: (
    <svg {...iconProps}>
      <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1z" />
      <path d="M9 21V14h6v7" />
    </svg>
  ),
  menu: (
    <svg {...iconProps}>
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
    </svg>
  ),
  cart: (
    <svg {...iconProps}>
      <path d="M6 6h15l-1.5 9H7.5z" />
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
      <path d="M1 1h4l1 5" />
    </svg>
  ),
  pin: (
    <svg {...iconProps}>
      <path d="M12 22c5.5-5 10-10 10-14a10 10 0 00-20 0c0 4 4.5 9 10 14z" />
      <circle cx="12" cy="8" r="3" />
      <path d="M8 21h8" />
    </svg>
  ),
  tracking: (
    <svg {...iconProps}>
      <path d="M14 18V6a2 2 0 00-2-2H4a2 2 0 00-2 2v11a1 1 0 001 1h2" />
      <path d="M15 18H9" />
      <path d="M19 18h2a1 1 0 001-1v-3.65a1 1 0 00-.22-.624l-3.48-4.35A1 1 0 0017.52 8H14" />
      <circle cx="17" cy="18" r="2" />
      <circle cx="7" cy="18" r="2" />
    </svg>
  ),
  history: (
    <svg {...iconProps}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 7h8M8 11h8M8 15h5" />
    </svg>
  ),
} as const

type BottomNavItem = {
  id: string
  label: string
  icon: ReactNode
  disabled?: boolean
  visited?: boolean
  badge?: number
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
  const activeIndex = items.findIndex((item) => item.id === activeId)
  const count = items.length || 1
  // Padding 12px each side, gap 4px between items
  // Each cell = (100% - 24px - (count-1)*4px) / count
  // Offset = index * (cellWidth + 4px) + 12px
  const cellPercent = `(100% - 24px - ${(count - 1) * 4}px) / ${count}`
  const leftCalc = `calc(12px + ${activeIndex} * (${cellPercent} + 4px))`
  const widthCalc = `calc(${cellPercent})`
  return (
    <nav className="bottom-nav" aria-label="Навигация">
      <div
        className="bottom-nav-indicator"
        style={{
          left: leftCalc,
          width: widthCalc,
        }}
      />
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
          <span className="bottom-nav-icon">
            {item.icon}
            {item.badge != null && item.badge > 0 ? (
              <span className="bottom-nav-badge">{item.badge}</span>
            ) : null}
          </span>
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
