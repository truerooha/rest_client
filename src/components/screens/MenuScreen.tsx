'use client'

import { useMemo, useState, useEffect, useRef } from 'react'
import { Section, EmptyState, PrimaryButton, StatusBanner } from '../ui'
import { MenuGrid } from '../features/MenuGrid'
import { useApp } from '../../store/AppContext'
import { calculateOrderTotals, formatPrice } from '../../lib/order-utils'

type MenuScreenProps = {
  onGoToSlot: () => void
  onNext: () => void
}

export function MenuScreen({ onGoToSlot, onNext }: MenuScreenProps) {
  const {
    selectedSlot,
    selectedRestaurantId,
    menuItems,
    cart,
    addToCart,
    deliverySlots,
  } = useApp()
  
  const activeMenuItems = useMemo(
    () => {
      if (!selectedRestaurantId) {
        return menuItems
      }
      const filtered = menuItems.filter(
        (item) => item.restaurantId === selectedRestaurantId,
      )
      // Если по какой-то причине фильтр дал пусто, но данные есть —
      // показываем всё меню, чтобы не оставлять пользователя без блюд.
      if (filtered.length === 0 && menuItems.length > 0) {
        return menuItems
      }
      return filtered
    },
    [menuItems, selectedRestaurantId],
  )
  
  const selectedSlotData = deliverySlots.find((slot) => slot.id === selectedSlot)
  const cartTotals = useMemo(
    () => calculateOrderTotals(cart, 1),
    [cart],
  )

  const [cartBarBump, setCartBarBump] = useState(false)
  const mountedRef = useRef(false)
  useEffect(() => {
    if (cart.length === 0) return
    if (!mountedRef.current) {
      mountedRef.current = true
      return
    }
    setCartBarBump(true)
    const t = setTimeout(() => setCartBarBump(false), 200)
    return () => clearTimeout(t)
  }, [cart.length, cartTotals.total])

  if (activeMenuItems.length === 0) {
    return (
      <Section title="Меню ресторана">
        <EmptyState
          emoji="🍽️"
          title={!selectedRestaurantId ? 'Выберите ресторан' : 'Меню пока пусто'}
          description={
            !selectedRestaurantId
              ? 'Перейдите на Главную и выберите ресторан'
              : 'Скоро здесь появятся доступные блюда'
          }
          action={
            !selectedRestaurantId
              ? { label: 'На Главную', onClick: onGoToSlot }
              : undefined
          }
        />
      </Section>
    )
  }
  
  return (
    <Section title="Меню ресторана">
      {selectedSlot && selectedSlotData ? (
        <StatusBanner icon="🕒">
          Принять заказ до {selectedSlotData.deadline}. Добавьте блюда
        </StatusBanner>
      ) : (
        <StatusBanner icon="📅" variant="warning">
          Слот доставки не выбран
        </StatusBanner>
      )}
      <MenuGrid
        menuItems={activeMenuItems}
        onAddToCart={addToCart}
        formatPrice={formatPrice}
      />
      {cart.length > 0 ? (
        <div
          className={`cart-summary-bar ${cartBarBump ? 'cart-summary-bar-bump' : ''}`}
          role="status"
          aria-live="polite"
          aria-label={`В заказе ${cart.length} позиций на ${formatPrice(cartTotals.total)}`}
        >
          <div className="cart-summary-row">
            <span>Позиции</span>
            <span className="cart-summary-total">
              {cart.length} · {formatPrice(cartTotals.total)}
            </span>
          </div>
          <PrimaryButton type="button" onClick={onNext}>
            Перейти к заказу
          </PrimaryButton>
        </div>
      ) : null}
    </Section>
  )
}
