'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTelegram } from '@/lib/telegram'
import { fetchBuildings, fetchUser, updateUserBuilding, Building } from '@/lib/api'

export default function Home() {
  const router = useRouter()
  const { user, isReady } = useTelegram()
  const [buildings, setBuildings] = useState<Building[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBuilding, setSelectedBuilding] = useState<number | null>(null)

  useEffect(() => {
    if (!isReady || !user) return

    const loadData = async () => {
      try {
        // Загружаем здания
        const buildingsData = await fetchBuildings()
        setBuildings(buildingsData)

        // Проверяем, есть ли у пользователя выбранное здание
        const userData = await fetchUser(user.id)
        if (userData?.building_id) {
          // Пользователь уже выбрал здание, перенаправляем на рестораны
          router.push(`/restaurants?buildingId=${userData.building_id}`)
          return
        }

        // Автоматически выбираем здание "Коворкинг"
        const coworkingBuilding = buildingsData.find(b => b.name === 'Коворкинг')
        if (coworkingBuilding) {
          // Устанавливаем здание для пользователя автоматически
          await updateUserBuilding(user.id, coworkingBuilding.id)
          router.push(`/restaurants?buildingId=${coworkingBuilding.id}`)
        } else {
          // Если "Коворкинг" не найден, показываем список зданий
          console.warn('Здание "Коворкинг" не найдено, показываем список')
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [isReady, user, router])

  const handleSelectBuilding = async (buildingId: number) => {
    if (!user) return

    setSelectedBuilding(buildingId)
    try {
      await updateUserBuilding(user.id, buildingId)
      router.push(`/restaurants?buildingId=${buildingId}`)
    } catch (error) {
      console.error('Error selecting building:', error)
      setSelectedBuilding(null)
    }
  }

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Загрузка...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <p className="text-gray-600">Откройте это приложение через Telegram бота</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Загрузка...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-2">Обед в Офис</h1>
        <p className="text-gray-600 mb-6">Выберите ваше здание:</p>

        <div className="space-y-3">
          {buildings.map((building) => (
            <button
              key={building.id}
              onClick={() => handleSelectBuilding(building.id)}
              disabled={selectedBuilding === building.id}
              className="w-full p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-left disabled:opacity-50"
            >
              <h3 className="font-semibold text-lg">{building.name}</h3>
              <p className="text-sm text-gray-500">{building.address}</p>
              {selectedBuilding === building.id && (
                <p className="text-sm text-blue-500 mt-2">Загрузка...</p>
              )}
            </button>
          ))}
        </div>

        {buildings.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Нет доступных зданий</p>
          </div>
        )}
      </div>
    </div>
  )
}
