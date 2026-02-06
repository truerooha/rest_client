'use client'

import type { DeliverySlot } from '../../lib/types'
import { Card, SecondaryButton } from '../ui'

type SlotSelectorProps = {
  slots: DeliverySlot[]
  selectedSlot: string | null
  onSelectSlot: (slotId: string) => void
}

export function SlotSelector({ slots, selectedSlot, onSelectSlot }: SlotSelectorProps) {
  return (
    <div className="slot-selector">
      {slots.map((slot) => (
        <Card
          key={slot.id}
          className={`slot-card ${slot.isAvailable ? '' : 'slot-disabled'} ${
            selectedSlot === slot.id ? 'slot-selected' : ''
          }`}
        >
          <div className="slot-time">{slot.time}</div>
          <div className="slot-note">
            {slot.isAvailable ? `До ${slot.deadline}` : 'Недоступно'}
          </div>
          <SecondaryButton
            type="button"
            onClick={() => slot.isAvailable && onSelectSlot(slot.id)}
            disabled={!slot.isAvailable}
            aria-pressed={selectedSlot === slot.id}
          >
            {selectedSlot === slot.id ? 'Выбрано' : 'Выбрать'}
          </SecondaryButton>
        </Card>
      ))}
    </div>
  )
}
