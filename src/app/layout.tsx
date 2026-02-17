import type { ReactNode } from 'react'
import Script from 'next/script'
import './globals.css'
import { AppProvider } from '../store/AppContext'

export const metadata = {
  title: 'Кускус delivery — Mini App',
  description: 'Предзаказ офисных обедов в Telegram Mini App',
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html
      lang="ru"
      style={
        {
          // Provide defaults for Telegram viewport CSS variables so SSR and client markup match.
          // These mirror the values the Telegram WebApp script may set ("100vh").
          ['--tg-viewport-height' as any]: '100vh',
          ['--tg-viewport-stable-height' as any]: '100vh',
        } as React.CSSProperties
      }
    >
      <head>
        <Script 
          src="https://telegram.org/js/telegram-web-app.js" 
          strategy="beforeInteractive" 
        />
      </head>
      <body>
        <AppProvider>
          <main className="page">{children}</main>
        </AppProvider>
      </body>
    </html>
  )
}
