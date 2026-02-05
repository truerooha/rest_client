'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

// Динамический импорт SDK только на клиенте
let WebApp: any = null
if (typeof window !== 'undefined') {
  WebApp = require('@twa-dev/sdk').default
}

interface TelegramContextType {
  webApp: any | null
  user: any | null
  isReady: boolean
}

const TelegramContext = createContext<TelegramContextType>({
  webApp: null,
  user: null,
  isReady: false,
})

export function TelegramProvider({ children }: { children: ReactNode }) {
  const [webApp, setWebApp] = useState<typeof WebApp | null>(null)
  const [user, setUser] = useState<typeof WebApp.initDataUnsafe.user | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && WebApp) {
      WebApp.ready()
      WebApp.expand()
      
      setWebApp(WebApp)
      setUser(WebApp.initDataUnsafe.user || null)
      setIsReady(true)

      // Настройка темы
      document.body.style.backgroundColor = WebApp.backgroundColor
    }
  }, [])

  return (
    <TelegramContext.Provider value={{ webApp, user, isReady }}>
      {children}
    </TelegramContext.Provider>
  )
}

export function useTelegram() {
  return useContext(TelegramContext)
}
