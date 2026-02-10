'use client'

import { useState } from 'react'
import { Section, Card, EmptyState, StatusBanner, SecondaryButton } from '../ui'
import { OrderStatusTimeline } from '../features/OrderStatusTimeline'
import { GroupOrderCard } from '../features/GroupOrderCard'
import { useApp } from '../../store/AppContext'
import { formatPrice, isDeadlinePassed, calculateOrderTotals } from '../../lib/order-utils'

type TrackingScreenProps = {
  apiUrl: string
}

export function TrackingScreen({ apiUrl }: TrackingScreenProps) {
  const { currentOrder, groupOrder, deliverySlots, cancelOrder } = useApp()
  const [cancelling, setCancelling] = useState(false)
  const slotData = currentOrder
    ? deliverySlots.find((s) => s.id === currentOrder.deliverySlot)
    : null
  const canCancel =
    currentOrder?.status === 'confirmed' &&
    slotData &&
    !isDeadlinePassed(slotData.deadline)
  
  if (!currentOrder) {
    return (
      <Section title="Отслеживание заказа">
        <EmptyState
          emoji="🔍"
          title="Нет активного заказа"
          description="Сделайте заказ, чтобы отслеживать его статус"
        />
      </Section>
    )
  }
  
  const isFormingPhase =
    slotData && !isDeadlinePassed(slotData.deadline) && currentOrder.status === 'confirmed'

  const { discount } = calculateOrderTotals(currentOrder.items, 1)

  const getStatusLabel = (status: string) => {
    if (status === 'pending' || (status === 'confirmed' && isFormingPhase)) {
      return 'Формируется общий заказ'
    }
    switch (status) {
      case 'confirmed':
        return 'Подтверждён рестораном'
      case 'preparing':
        return 'Готовится'
      case 'ready':
        return 'Готов к отправке'
      case 'delivered':
        return 'Доставлен'
      case 'cancelled':
        return 'Отменён'
      default:
        return status
    }
  }

  const statusVariant = currentOrder.status === 'cancelled'
    ? 'error'
    : currentOrder.status === 'pending'
      ? 'warning'
      : 'default'

  return (
    <Section title="Отслеживание заказа">
      <StatusBanner
        icon={currentOrder.status === 'cancelled' ? '❗' : '🚚'}
        variant={statusVariant}
      >
        Статус заказа: {getStatusLabel(currentOrder.status)}
      </StatusBanner>
      <Card>
        <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>
          Ваш заказ
        </div>
        <div className="muted" style={{ marginBottom: 16 }}>
          Доставка в {currentOrder.deliverySlot}
        </div>
        
        <OrderStatusTimeline
          currentStatus={isFormingPhase ? 'pending' : currentOrder.status}
        />
        
        <div className="divider" />
        
        <div style={{ display: 'grid', gap: 6 }}>
          {currentOrder.items.map((item) => (
            <div
              key={item.item.id}
              className="row"
              style={{ justifyContent: 'space-between', fontSize: 14 }}
            >
              <span>
                {item.item.name} × {item.qty}
              </span>
              <span>{formatPrice(item.item.price * item.qty)}</span>
            </div>
          ))}
          {discount > 0 ? (
            <div
              className="row"
              style={{
                justifyContent: 'space-between',
                fontSize: 14,
                color: 'var(--success)',
              }}
            >
              <span>Скидка</span>
              <span>-{formatPrice(discount)}</span>
            </div>
          ) : null}
        </div>
        
        <div className="divider" />
        
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <strong>Итого:</strong>
          <span className="price-summary-total">
            {formatPrice(currentOrder.totalPrice)}
          </span>
        </div>
        {canCancel ? (
          <div style={{ marginTop: 16 }}>
            <SecondaryButton
              type="button"
              onClick={async () => {
                setCancelling(true)
                try {
                  await cancelOrder(apiUrl, currentOrder.id)
                } finally {
                  setCancelling(false)
                }
              }}
              disabled={cancelling}
            >
              {cancelling ? 'Отмена...' : 'Отменить заказ'}
            </SecondaryButton>
          </div>
        ) : null}
      </Card>

      {groupOrder ? (
        <GroupOrderCard
          participantCount={groupOrder.participantCount}
          totalAmount={groupOrder.totalAmount}
          minimumAmount={groupOrder.minimumAmount}
          slotDeadline={slotData?.deadline}
        />
      ) : null}
    </Section>
  )
}
