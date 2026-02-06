import { ReactNode } from 'react'

type CommonProps = {
  className?: string
  children?: ReactNode
}

function cx(...classes: Array<string | undefined | false>): string {
  return classes.filter(Boolean).join(' ')
}

export function PrimaryButton({
  className,
  children,
  ...props
}: CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} className={cx('btn', className)}>
      {children}
    </button>
  )
}

export function SecondaryButton({
  className,
  children,
  ...props
}: CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} className={cx('btn-secondary', className)}>
      {children}
    </button>
  )
}

export function IconButton({
  className,
  children,
  ...props
}: CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} className={cx('btn-icon', className)}>
      {children}
    </button>
  )
}
