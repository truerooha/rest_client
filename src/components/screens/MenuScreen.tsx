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
  
  const orderSlotLabel = selectedSlot ? `Доставка в ${selectedSlot}` : 'Слот не выбран'
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

  if (!selectedSlot) {
    return (
      <Section title="Меню ресторана">
        <EmptyState
          emoji="📅"
          title="Сначала выберите слот"
          description="После выбора слота откроется меню"
          action={{
            label: 'Перейти к выбору слота',
            onClick: onGoToSlot,
          }}
        />
      </Section>
    )
  }
  
  if (activeMenuItems.length === 0) {
    return (
      <Section title="Меню ресторана" subtitle={orderSlotLabel}>
        <EmptyState
          emoji="🍽️"
          title="Меню пока пусто"
          description="Скоро здесь появятся доступные блюда"
        />
      </Section>
    )
  }
  
  return (
    <Section title="Меню ресторана" subtitle={orderSlotLabel}>
      <StatusBanner icon="🕒">
        {selectedSlotData
          ? `Принять заказ до ${selectedSlotData.deadline}. Добавьте блюда`
          : 'Слот выбран. Добавьте блюда'}
      </StatusBanner>
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
