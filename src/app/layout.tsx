import type { ReactNode } from 'react'
import Script from 'next/script'
import './globals.css'
import { AppProvider } from '../store/AppContext'

export const metadata = {
  title: 'Обед в Офис — Mini App',
  description: 'Предзаказ офисных обедов в Telegram Mini App',
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="ru">
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
