'use client'

import { useMemo } from 'react'
import { Section, EmptyState, PrimaryButton } from '../ui'
import { MenuGrid } from '../features/MenuGrid'
import { useApp } from '../../store/AppContext'

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
  } = useApp()
  
  const activeMenuItems = useMemo(
    () => menuItems.filter((item) => item.restaurantId === selectedRestaurantId),
    [menuItems, selectedRestaurantId],
  )
  
  const formatPrice = (price: number) => `${price} ₽`
  
  const orderSlotLabel = selectedSlot ? `Доставка в ${selectedSlot}` : 'Слот не выбран'
  
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
      <MenuGrid
        menuItems={activeMenuItems}
        onAddToCart={addToCart}
        formatPrice={formatPrice}
      />
      {cart.length > 0 ? (
        <div style={{ marginTop: 16 }}>
          <PrimaryButton type="button" onClick={onNext}>
            Перейти к заказу ({cart.length})
          </PrimaryButton>
        </div>
      ) : null}
    </Section>
  )
}
