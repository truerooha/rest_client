'use client'

import { Section, PrimaryButton, EmptyState, StatusBanner } from '../ui'
import { SlotSelector } from '../features/SlotSelector'
import { useApp } from '../../store/AppContext'

type SlotScreenProps = {
  onNext: () => void
}

export function SlotScreen({ onNext }: SlotScreenProps) {
  const { deliverySlots, selectedSlot, setSelectedSlot } = useApp()
  
  if (deliverySlots.length === 0) {
    return (
      <Section title="Выбор слота доставки">
        <EmptyState
          emoji="📅"
          title="Нет доступных слотов"
          description="Слоты доставки временно недоступны"
        />
      </Section>
    )
  }
  
  const availableCount = deliverySlots.filter((slot) => slot.isAvailable).length
  const selectedSlotData = deliverySlots.find((slot) => slot.id === selectedSlot)
  
  return (
    <Section
      title="Выбор слота доставки"
      subtitle={`Доступно слотов: ${availableCount}`}
    >
      {selectedSlotData ? (
        <StatusBanner icon="⏳">
          Выбран слот {selectedSlotData.time}. Дедлайн до {selectedSlotData.deadline}
        </StatusBanner>
      ) : (
        <StatusBanner icon="✅">
          Выберите удобный слот, чтобы открыть меню ресторана
        </StatusBanner>
      )}
      <SlotSelector
        slots={deliverySlots}
        selectedSlot={selectedSlot}
        onSelectSlot={setSelectedSlot}
      />
      <PrimaryButton type="button" onClick={onNext} disabled={!selectedSlot}>
        Перейти к меню
      </PrimaryButton>
    </Section>
  )
}
