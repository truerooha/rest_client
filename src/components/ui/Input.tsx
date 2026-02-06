import { ReactNode } from 'react'

type InputFieldProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  icon?: ReactNode
  disabled?: boolean
  className?: string
}

export function InputField({
  value,
  onChange,
  placeholder,
  type = 'text',
  icon,
  disabled,
  className,
}: InputFieldProps) {
  return (
    <div className={`input-field ${className ?? ''}`}>
      {icon ? <div className="input-icon">{icon}</div> : null}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="input"
      />
    </div>
  )
}

type SearchBarProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  onClear?: () => void
}

export function SearchBar({ value, onChange, placeholder = 'Поиск...', onClear }: SearchBarProps) {
  return (
    <div className="search-bar">
      <div className="search-icon">🔍</div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="search-input"
      />
      {value && onClear ? (
        <button type="button" onClick={onClear} className="search-clear">
          ✕
        </button>
      ) : null}
    </div>
  )
}
