import { Suspense } from 'react'
import MenuContent from './MenuContent'

export default function MenuPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><p className="text-gray-500">Загрузка...</p></div>}>
      <MenuContent />
    </Suspense>
  )
}
