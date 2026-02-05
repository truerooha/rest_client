'use client'

import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart'
import { useTelegram } from '@/lib/telegram'
import { useEffect, useState } from 'react'

export default function CartPage() {
  const router = useRouter()
  const { items, updateQuantity, removeItem, totalPrice, totalItems, clearCart } = useCart()
  const { webApp } = useTelegram()
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!webApp) return

    // Показываем кнопку оформления заказа
    if (totalItems > 0) {
      webApp.MainButton.setText(`Оформить заказ - ${totalPrice}₽`)
      webApp.MainButton.show()
      webApp.MainButton.onClick(handleCheckout)
    } else {
      webApp.MainButton.hide()
    }

    return () => {
      webApp.MainButton.offClick(handleCheckout)
      webApp.MainButton.hide()
    }
  }, [webApp, totalItems, totalPrice])

  const handleCheckout = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      // TODO: Реализовать оформление заказа
      // Сейчас просто показываем уведомление
      webApp?.showAlert('Оформление заказа будет доступно в следующей версии!')
      clearCart()
      router.push('/')
    } catch (error) {
      console.error('Error creating order:', error)
      webApp?.showAlert('Ошибка при оформлении заказа')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-md mx-auto">
        <div className="sticky top-0 bg-white shadow-sm z-10 p-4">
          <button
            onClick={() => router.back()}
            className="text-blue-500 text-sm mb-2"
          >
            ← Назад к меню
          </button>
          <h1 className="text-2xl font-bold">Корзина</h1>
          <p className="text-gray-600">
            {totalItems} {totalItems === 1 ? 'позиция' : 'позиций'}
          </p>
        </div>

        <div className="p-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Корзина пуста</p>
              <button
                onClick={() => router.back()}
                className="text-blue-500"
              >
                Вернуться к меню
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.price}₽</p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 text-sm ml-4"
                    >
                      Удалить
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                    <div className="font-bold text-lg">
                      {item.price * item.quantity}₽
                    </div>
                  </div>
                </div>
              ))}

              <div className="bg-white rounded-lg shadow p-4 mt-6">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Итого:</span>
                  <span>{totalPrice}₽</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
