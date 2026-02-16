'use client'

import { Section, EmptyState, StatusBanner, PrimaryButton } from '../ui'
import { SlotSelector } from '../features/SlotSelector'
import { useApp } from '../../store/AppContext'
import { isDeadlinePassed } from '../../lib/order-utils'

type SlotScreenProps = {
  onSelectRestaurant: (restaurantId: number) => void
  onSelectSlot: (slotId: string) => void
  onJoinLobby?: (slotId: string) => Promise<void>
  onLeaveLobby?: (slotId: string) => Promise<void>
  onGoToMenu?: (slotId: string) => void
  userOrderSlotIds?: string[]
}

export function SlotScreen({
  onSelectRestaurant,
  onSelectSlot,
  onJoinLobby,
  onLeaveLobby,
  onGoToMenu,
  userOrderSlotIds = [],
}: SlotScreenProps) {
  const {
    deliverySlots,
    selectedSlot,
    restaurants,
    selectedRestaurantId,
    appTimezone,
  } = useApp()

  const userSlotsSet = new Set(userOrderSlotIds)
  const hasMultipleRestaurants = restaurants.length > 1
  const availableCount = deliverySlots.filter(
    (slot) =>
      slot.isAvailable &&
      !isDeadlinePassed(slot.deadline, appTimezone),
  ).length

  const lobbySlot = deliverySlots.find((s) => s.userInLobby && !s.isActivated)
  const activatedLobbySlot = deliverySlots.find((s) => {
    if (!s.userInLobby || !s.isActivated) return false
    const deadlinePassed = isDeadlinePassed(s.deadline, appTimezone)
    const hasUserOrder = userSlotsSet.has(s.id)
    // Баннер активированного слота показываем только если по нему
    // ещё можно сделать заказ ИЛИ у пользователя уже есть заказ в этом слоте.
    return !deadlinePassed || hasUserOrder
  })

  return (
    <>
      {lobbySlot && (
        <StatusBanner icon="👥">
          Вы в лобби на {lobbySlot.time}. Нужно ещё{' '}
          {(lobbySlot.minParticipants ?? 0) - (lobbySlot.currentParticipants ?? 0)} человек. До
          активации до {lobbySlot.lobbyDeadline}.
        </StatusBanner>
      )}
      {activatedLobbySlot && (
        <div className="slot-activated-banner">
          <StatusBanner icon="✅">
            Слот {activatedLobbySlot.time} активирован. Выберите меню и оформите заказ.
          </StatusBanner>
          {onGoToMenu && !isDeadlinePassed(activatedLobbySlot.deadline, appTimezone) && (
            <PrimaryButton
              type="button"
              onClick={() => onGoToMenu(activatedLobbySlot.id)}
              className="slot-banner-cta"
            >
              К меню
            </PrimaryButton>
          )}
        </div>
      )}
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

      <Section title="Слот доставки">
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
            onJoinLobby={onJoinLobby}
            onLeaveLobby={onLeaveLobby}
            appTimezone={appTimezone}
            userOrderSlotIds={userOrderSlotIds}
          />
        )}
      </Section>
    </>
  )
}
