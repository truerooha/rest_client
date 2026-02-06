import type { ReactNode } from 'react'
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
      <body>
        <AppProvider>
          <main className="page">{children}</main>
        </AppProvider>
      </body>
    </html>
  )
}
