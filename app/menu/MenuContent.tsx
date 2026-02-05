'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { fetchMenu, MenuItem } from '@/lib/api'
import { useCart } from '@/lib/cart'
import { useTelegram } from '@/lib/telegram'

export default function MenuContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const restaurantId = searchParams.get('restaurantId')
  const { webApp } = useTelegram()
  const { addItem, totalPrice, totalItems } = useCart()

  const [grouped, setGrouped] = useState<Record<string, MenuItem[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!restaurantId) {
      router.push('/')
      return
    }

    const loadMenu = async () => {
      try {
        const data = await fetchMenu(parseInt(restaurantId))
        setGrouped(data.grouped)
      } catch (error) {
        console.error('Error loading menu:', error)
      } finally {
        setLoading(false)
      }
    }

    loadMenu()
  }, [restaurantId, router])

  useEffect(() => {
    if (!webApp) return

    if (totalItems > 0) {
      webApp.MainButton.setText(`Корзина (${totalItems}) - ${totalPrice}₽`)
      webApp.MainButton.show()
      webApp.MainButton.onClick(() => {
        router.push('/cart')
      })
    } else {
      webApp.MainButton.hide()
    }

    return () => {
      webApp.MainButton.offClick(() => {})
    }
  }, [webApp, totalItems, totalPrice, router])

  const handleAddItem = (item: MenuItem) => {
    addItem(item)
    webApp?.HapticFeedback.impactOccurred('light')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Загрузка меню...</p>
      </div>
    )
  }

  const categories = Object.keys(grouped)

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-md mx-auto">
        <div className="sticky top-0 bg-white shadow-sm z-10 p-4">
          <button
            onClick={() => router.back()}
            className="text-blue-500 text-sm mb-2"
          >
            ← Назад
          </button>
          <h1 className="text-2xl font-bold">Меню</h1>
        </div>

        <div className="p-4">
          {categories.map((category) => (
            <div key={category} className="mb-8">
              <h2 className="text-xl font-semibold mb-3">{category}</h2>
              <div className="space-y-3">
                {grouped[category].map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg shadow p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.name}</h3>
                        {item.description && (
                          <p className="text-sm text-gray-500 mt-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <div className="text-lg font-bold ml-4">{item.price}₽</div>
                    </div>
                    <button
                      onClick={() => handleAddItem(item)}
                      className="w-full mt-2 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Добавить
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {categories.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Меню пусто</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
