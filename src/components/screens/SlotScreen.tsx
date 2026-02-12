'use client'

import { Section, EmptyState } from '../ui'
import { SlotSelector } from '../features/SlotSelector'
import { useApp } from '../../store/AppContext'
import { isDeadlinePassed } from '../../lib/order-utils'

type SlotScreenProps = {
  onSelectRestaurant: (restaurantId: number) => void
  onSelectSlot: (slotId: string) => void
}

export function SlotScreen({ onSelectRestaurant, onSelectSlot }: SlotScreenProps) {
  const {
    deliverySlots,
    selectedSlot,
    restaurants,
    selectedRestaurantId,
    appTimezone,
  } = useApp()

  const hasMultipleRestaurants = restaurants.length > 1
  const availableCount = deliverySlots.filter(
    (slot) => slot.isAvailable && !isDeadlinePassed(slot.deadline, appTimezone),
  ).length

  return (
    <>
      {hasMultipleRestaurants && (
        <Section title="Ресторан">
          <div className="restaurant-grid">
            {restaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className={`restaurant-mini-card ${
                  selectedRestaurantId === restaurant.id
                    ? 'restaurant-mini-card-selected'
                    : ''
                }`}
                onClick={() => onSelectRestaurant(restaurant.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSelectRestaurant(restaurant.id)
                  }
                }}
                role="button"
                tabIndex={0}
                aria-pressed={selectedRestaurantId === restaurant.id}
              >
                <span className="restaurant-mini-emoji">
                  {restaurant.coverEmoji}
                </span>
                <span className="restaurant-mini-name">{restaurant.name}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section
        title="Слот доставки"
        subtitle={
          deliverySlots.length > 0
            ? `Доступно слотов: ${availableCount}`
            : undefined
        }
      >
        {deliverySlots.length === 0 ? (
          <EmptyState
            emoji="📅"
            title="Нет доступных слотов"
            description="Слоты доставки временно недоступны"
          />
        ) : (
          <SlotSelector
            slots={deliverySlots}
            selectedSlot={selectedSlot}
            onSelectSlot={onSelectSlot}
            appTimezone={appTimezone}
          />
        )}
      </Section>
    </>
  )
}
