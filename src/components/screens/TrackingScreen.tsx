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
  const { currentOrder, groupOrder, deliverySlots, cancelOrder, appTimezone } = useApp()
  const [cancelling, setCancelling] = useState(false)
  const slotData = currentOrder
    ? deliverySlots.find((s) => s.id === currentOrder.deliverySlot)
    : null
  const canCancel =
    (currentOrder?.status === 'pending' || currentOrder?.status === 'confirmed') &&
    slotData &&
    !isDeadlinePassed(slotData.deadline, appTimezone)
  
  if (!currentOrder) {
    return (
      <Section>
        <EmptyState
          emoji="🔍"
          title="Нет активного заказа"
          description="Сделайте заказ, чтобы отслеживать его статус"
        />
      </Section>
    )
  }
  
  const { discount, serviceFee } = calculateOrderTotals(currentOrder.items, 1)

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Ожидает'
      case 'confirmed':
        return 'Подтверждён'
      case 'restaurant_confirmed':
        return 'Подтверждён'
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
    <Section>
      <StatusBanner
        icon={currentOrder.status === 'cancelled' ? '❗' : '🚚'}
        variant={statusVariant}
      >
        Статус заказа: {getStatusLabel(currentOrder.status)}
      </StatusBanner>
      <Card>
        <div className="card-title">
          Ваш заказ
        </div>
        <div className="muted mb-16">
          Доставка в {currentOrder.deliverySlot}
        </div>
        
        <OrderStatusTimeline
          currentStatus={currentOrder.status}
        />
        
        <div className="divider" />
        
        <div className="items-grid">
          {currentOrder.items.map((item) => (
            <div
              key={item.item.id}
              className="row-between item-line"
            >
              <span>
                {item.item.name} × {item.qty}
              </span>
              <span>{formatPrice(item.item.price * item.qty)}</span>
            </div>
          ))}
          {discount > 0 ? (
            <div className="row-between item-line discount-line">
              <span>Скидка</span>
              <span>-{formatPrice(discount)}</span>
            </div>
          ) : null}
          {serviceFee > 0 ? (
            <div className="row-between item-line service-fee-line">
              <span>Сервисный сбор</span>
              <span>+{formatPrice(serviceFee)}</span>
            </div>
          ) : null}
        </div>
        
        <div className="divider" />
        
        <div className="row-between">
          <strong>Итого:</strong>
          <span className="price-summary-total">
            {formatPrice(currentOrder.totalPrice)}
          </span>
        </div>
        {canCancel ? (
          <div className="mt-16">
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
