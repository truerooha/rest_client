'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { fetchRestaurants, Restaurant } from '@/lib/api'

export default function RestaurantsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const buildingId = searchParams.get('buildingId')

  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!buildingId) {
      router.push('/')
      return
    }

    const loadRestaurants = async () => {
      try {
        const data = await fetchRestaurants(parseInt(buildingId))
        setRestaurants(data)
      } catch (error) {
        console.error('Error loading restaurants:', error)
      } finally {
        setLoading(false)
      }
    }

    loadRestaurants()
  }, [buildingId, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Загрузка ресторанов...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.push('/')}
            className="text-blue-500 text-sm mb-2"
          >
            ← Назад к зданиям
          </button>
          <h1 className="text-2xl font-bold">Рестораны</h1>
          <p className="text-gray-600">Выберите ресторан:</p>
        </div>

        <div className="space-y-3">
          {restaurants.map((restaurant) => (
            <button
              key={restaurant.id}
              onClick={() => router.push(`/menu?restaurantId=${restaurant.id}`)}
              className="w-full p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-left"
            >
              <h3 className="font-semibold text-lg">{restaurant.name}</h3>
              <p className="text-sm text-gray-500 mt-1">Посмотреть меню →</p>
            </button>
          ))}
        </div>

        {restaurants.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">В этом здании пока нет ресторанов</p>
          </div>
        )}
      </div>
    </div>
  )
}
