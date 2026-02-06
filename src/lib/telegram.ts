import { TgAuth, TgUser } from './types'

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData?: string
        initDataUnsafe?: {
          user?: {
            id: number
            first_name?: string
            last_name?: string
            username?: string
            language_code?: string
            photo_url?: string
          }
          auth_date?: number
          hash?: string
        }
        ready?: () => void
        expand?: () => void
      }
    }
  }
}

export function initTelegramWebApp(): void {
  if (typeof window === 'undefined') return
  const webApp = window.Telegram?.WebApp
  webApp?.ready?.()
  webApp?.expand?.()
}

export function readTelegramAuth(): TgAuth | null {
  if (typeof window === 'undefined') return null

  const webApp = window.Telegram?.WebApp
  const initData = webApp?.initData ?? ''
  const unsafe = webApp?.initDataUnsafe

  if (!initData || !unsafe?.user) {
    return null
  }

  const user: TgUser = {
    id: unsafe.user.id,
    firstName: unsafe.user.first_name ?? 'Пользователь',
    lastName: unsafe.user.last_name,
    username: unsafe.user.username,
    photoUrl: unsafe.user.photo_url,
    languageCode: unsafe.user.language_code,
  }

  return {
    source: 'telegram',
    initData,
    user,
    authDate: unsafe.auth_date,
    hash: unsafe.hash,
  }
}

export function createLocalAuth(user: TgUser): TgAuth {
  return {
    source: 'local',
    initData: 'local_test',
    user,
  }
}
