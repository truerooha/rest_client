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
