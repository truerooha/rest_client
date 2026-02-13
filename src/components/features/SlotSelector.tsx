'use client'

import { useState } from 'react'
import type { DeliverySlot } from '../../lib/types'
import { Card, SecondaryButton, PrimaryButton, Chip } from '../ui'
import { isDeadlinePassed } from '../../lib/order-utils'

type SlotSelectorProps = {
  slots: DeliverySlot[]
  selectedSlot: string | null
  onSelectSlot: (slotId: string) => void
  appTimezone?: string
  userOrderSlotIds?: string[]
  onJoinLobby?: (slotId: string) => Promise<void>
  onLeaveLobby?: (slotId: string) => Promise<void>
}

function formatDeliveryPrice(cents: number): string {
  if (cents === 0) return 'доставка бесплатно'
  return `доставка ${Math.round(cents / 100)} ₽`
}

export function SlotSelector({
  slots,
  selectedSlot,
  onSelectSlot,
  appTimezone = 'Europe/Moscow',
  userOrderSlotIds = [],
  onJoinLobby,
  onLeaveLobby,
}: SlotSelectorProps) {
  const userSlotsSet = new Set(userOrderSlotIds)
  const [loadingSlotId, setLoadingSlotId] = useState<string | null>(null)

  const handleJoin = async (slotId: string) => {
    if (!onJoinLobby || loadingSlotId) return
    setLoadingSlotId(slotId)
    try {
      await onJoinLobby(slotId)
    } finally {
      setLoadingSlotId(null)
    }
  }

  const handleLeave = async (slotId: string) => {
    if (!onLeaveLobby || loadingSlotId) return
    setLoadingSlotId(slotId)
    try {
      await onLeaveLobby(slotId)
    } finally {
      setLoadingSlotId(null)
    }
  }

  return (
    <div className="slot-selector">
      {slots.map((slot) => {
        const deadlinePassed = isDeadlinePassed(slot.deadline, appTimezone)
        const hasUserOrder = userSlotsSet.has(slot.id)
        const hasLobby =
          slot.lobbyDeadline != null &&
          slot.minParticipants != null &&
          slot.currentParticipants != null
        const lobbyDeadlinePassed =
          hasLobby && slot.lobbyDeadline
            ? isDeadlinePassed(slot.lobbyDeadline, appTimezone)
            : false
        const isActivated = slot.isActivated ?? false
        const userInLobby = slot.userInLobby ?? false

        let isSelectable = false
        let primaryLabel = 'Выбрать'
        let showSecondary = false
        let secondaryLabel = ''
        let cardDisabled = false
        let noteText = ''
        let showLobbyInfo = false

        if (hasLobby && onJoinLobby && onLeaveLobby) {
          if (lobbyDeadlinePassed && !isActivated) {
            cardDisabled = true
            noteText = 'Слот отменён'
          } else if (isActivated) {
            isSelectable = !deadlinePassed || hasUserOrder
            primaryLabel = 'Выбрать меню'
            noteText = hasUserOrder
              ? deadlinePassed
                ? 'Ваш заказ'
                : `Принять заказ до ${slot.deadline}`
              : `Принять заказ до ${slot.deadline}`
            showLobbyInfo = true
          } else if (userInLobby) {
            showSecondary = true
            secondaryLabel = 'Выйти'
            noteText = `Активировать до ${slot.lobbyDeadline}`
            showLobbyInfo = true
          } else {
            isSelectable = !lobbyDeadlinePassed
            primaryLabel = 'Присоединиться'
            noteText = `Активировать до ${slot.lobbyDeadline}`
            showLobbyInfo = true
          }
        } else {
          const isAvailableForNewOrder = slot.isAvailable && !deadlinePassed
          isSelectable = isAvailableForNewOrder || hasUserOrder
          primaryLabel = selectedSlot === slot.id ? 'Выбрано' : 'Выбрать'
          noteText = hasUserOrder
            ? deadlinePassed
              ? 'Ваш заказ'
              : `Принять заказ до ${slot.deadline}`
            : deadlinePassed
              ? 'Приём заказов завершён'
              : isAvailableForNewOrder
                ? `Принять заказ до ${slot.deadline}`
                : 'Недоступно'
        }

        const isLoading = loadingSlotId === slot.id

        return (
          <Card
            key={slot.id}
            className={`slot-card ${cardDisabled ? 'slot-disabled' : ''} ${
              selectedSlot === slot.id ? 'slot-selected' : ''
            } ${userInLobby ? 'slot-in-lobby' : ''}`}
          >
            <div className="slot-time">{slot.time}</div>
            {showLobbyInfo && hasLobby && (
              <div className="slot-lobby-info" aria-label={`${slot.currentParticipants} из ${slot.minParticipants} человек`}>
                <span className="slot-lobby-count">
                  👥 {slot.currentParticipants}/{slot.minParticipants} человек
                </span>
                <span className="slot-delivery-price">
                  {formatDeliveryPrice(slot.deliveryPriceCents ?? 0)}
                </span>
              </div>
            )}
            {userInLobby && (
              <div className="slot-lobby-badge">
                <Chip>Вы в лобби</Chip>
              </div>
            )}
            <div className="slot-note">{noteText}</div>
            <div className="slot-actions">
              {showSecondary ? (
                <SecondaryButton
                  type="button"
                  onClick={() => handleLeave(slot.id)}
                  disabled={isLoading}
                  aria-label="Выйти из лобби"
                >
                  {secondaryLabel}
                </SecondaryButton>
              ) : (
                <PrimaryButton
                  type="button"
                  onClick={() => {
                    if (isActivated) {
                      onSelectSlot(slot.id)
                    } else if (hasLobby && onJoinLobby && !userInLobby && !lobbyDeadlinePassed) {
                      handleJoin(slot.id)
                    } else if (isSelectable) {
                      onSelectSlot(slot.id)
                    }
                  }}
                  disabled={
                    cardDisabled ||
                    isLoading ||
                    (!isActivated && !(hasLobby && !userInLobby && !lobbyDeadlinePassed) && !isSelectable)
                  }
                  aria-pressed={selectedSlot === slot.id}
                  aria-label={primaryLabel}
                >
                  {primaryLabel}
                </PrimaryButton>
              )}
            </div>
          </Card>
        )
      })}
    </div>
  )
}
