import type { ReactNode } from 'react'
import './globals.css'

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
        <main className="page">{children}</main>
      </body>
    </html>
  )
}
