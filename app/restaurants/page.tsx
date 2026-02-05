import { Suspense } from 'react'
import RestaurantsContent from './RestaurantsContent'

export default function RestaurantsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><p className="text-gray-500">Загрузка...</p></div>}>
      <RestaurantsContent />
    </Suspense>
  )
}
