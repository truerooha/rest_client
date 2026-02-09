'use client'

import type { DeliverySlot } from '../../lib/types'
import { Card, SecondaryButton } from '../ui'
import { isDeadlinePassed } from '../../lib/order-utils'

type SlotSelectorProps = {
  slots: DeliverySlot[]
  selectedSlot: string | null
  onSelectSlot: (slotId: string) => void
}

export function SlotSelector({ slots, selectedSlot, onSelectSlot }: SlotSelectorProps) {
  return (
    <div className="slot-selector">
      {slots.map((slot) => {
        const deadlinePassed = isDeadlinePassed(slot.deadline)
        const isAvailable = slot.isAvailable && !deadlinePassed

        return (
          <Card
            key={slot.id}
            className={`slot-card ${isAvailable ? '' : 'slot-disabled'} ${
              selectedSlot === slot.id ? 'slot-selected' : ''
            }`}
          >
            <div className="slot-time">{slot.time}</div>
            <div className="slot-note">
              {deadlinePassed
                ? 'Приём заказов завершён'
                : isAvailable
                  ? `Принять заказ до ${slot.deadline}`
                  : 'Недоступно'}
            </div>
            <SecondaryButton
              type="button"
              onClick={() => isAvailable && onSelectSlot(slot.id)}
              disabled={!isAvailable}
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
