'use client'

import { useState } from 'react'

type Props = {
  onJoin: (code: string) => Promise<void>
}

export function InviteCodeScreen({ onJoin }: Props) {
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    const trimmed = code.trim().toUpperCase()
    if (trimmed.length !== 6) {
      setError('Код должен содержать 6 символов')
      return
    }
    setError(null)
    setLoading(true)
    try {
      await onJoin(trimmed)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Ошибка'
      if (msg === 'invalid_invite_code') {
        setError('Неверный invite-код. Проверьте и попробуйте снова.')
      } else {
        setError('Не удалось подключиться. Попробуйте позже.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      padding: 'var(--space-lg)',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 48, marginBottom: 'var(--space-md)' }}>🏢</div>
      <h2 style={{
        fontSize: 20,
        fontWeight: 700,
        color: 'var(--text-primary)',
        marginBottom: 'var(--space-xs)',
      }}>
        Добро пожаловать!
      </h2>
      <p style={{
        fontSize: 14,
        color: 'var(--text-secondary)',
        marginBottom: 'var(--space-lg)',
        maxWidth: 280,
      }}>
        Введите invite-код вашего офиса, чтобы начать заказывать обеды
      </p>

      <input
        className="input"
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
        placeholder="XXXXXX"
        maxLength={6}
        style={{
          textAlign: 'center',
          fontSize: 20,
          letterSpacing: 4,
          fontWeight: 600,
          width: 200,
          marginBottom: 'var(--space-md)',
        }}
        disabled={loading}
        autoFocus
      />

      {error && (
        <p style={{
          fontSize: 13,
          color: 'var(--danger)',
          marginBottom: 'var(--space-md)',
          maxWidth: 280,
        }}>
          {error}
        </p>
      )}

      <button
        type="button"
        className="btn"
        onClick={handleSubmit}
        disabled={loading || code.trim().length !== 6}
        style={{
          minWidth: 200,
          opacity: loading || code.trim().length !== 6 ? 0.5 : 1,
        }}
      >
        {loading ? 'Подключение...' : 'Подключиться'}
      </button>
    </div>
  )
}
