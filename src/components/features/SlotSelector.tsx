'use client'

import type { DeliverySlot } from '../../lib/types'
import { Card, SecondaryButton } from '../ui'
import { isDeadlinePassed } from '../../lib/order-utils'

type SlotSelectorProps = {
  slots: DeliverySlot[]
  selectedSlot: string | null
  onSelectSlot: (slotId: string) => void
  appTimezone?: string
  /** Слоты, где у пользователя уже есть заказ — остаются доступными для выбора (просмотр статуса) */
  userOrderSlotIds?: string[]
}

export function SlotSelector({
  slots,
  selectedSlot,
  onSelectSlot,
  appTimezone = 'Europe/Moscow',
  userOrderSlotIds = [],
}: SlotSelectorProps) {
  const userSlotsSet = new Set(userOrderSlotIds)

  return (
    <div className="slot-selector">
      {slots.map((slot) => {
        const deadlinePassed = isDeadlinePassed(slot.deadline, appTimezone)
        const hasUserOrder = userSlotsSet.has(slot.id)
        const isAvailableForNewOrder = slot.isAvailable && !deadlinePassed
        const isSelectable = isAvailableForNewOrder || hasUserOrder

        return (
          <Card
            key={slot.id}
            className={`slot-card ${isSelectable ? '' : 'slot-disabled'} ${
              selectedSlot === slot.id ? 'slot-selected' : ''
            }`}
          >
            <div className="slot-time">{slot.time}</div>
            <div className="slot-note">
              {hasUserOrder
                ? deadlinePassed
                  ? 'Ваш заказ'
                  : `Принять заказ до ${slot.deadline}`
                : deadlinePassed
                  ? 'Приём заказов завершён'
                  : isAvailableForNewOrder
                    ? `Принять заказ до ${slot.deadline}`
                    : 'Недоступно'}
            </div>
            <SecondaryButton
              type="button"
              onClick={() => isSelectable && onSelectSlot(slot.id)}
              disabled={!isSelectable}
              aria-pressed={selectedSlot === slot.id}
            >
              {selectedSlot === slot.id ? 'Выбрано' : 'Выбрать'}
            </SecondaryButton>
          </Card>
        )
      })}
    </div>
  )
}
