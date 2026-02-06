'use client'

import { useEffect } from 'react'
import { Section, Card, EmptyState } from '../ui'
import { OrderStatusTimeline } from '../features/OrderStatusTimeline'
import { GroupOrderCard } from '../features/GroupOrderCard'
import { useApp } from '../../store/AppContext'
import { formatPrice } from '../../lib/order-utils'

export function TrackingScreen() {
  const { currentOrder, groupOrder } = useApp()
  
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
  
  return (
    <Section title="Отслеживание заказа">
      <Card>
        <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>
          Ваш заказ
        </div>
        <div className="muted" style={{ marginBottom: 16 }}>
          Доставка в {currentOrder.deliverySlot}
        </div>
        
        <OrderStatusTimeline currentStatus={currentOrder.status} />
        
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
        </div>
        
        <div className="divider" />
        
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <strong>Итого:</strong>
          <strong style={{ color: 'var(--primary)', fontSize: 18 }}>
            {formatPrice(currentOrder.totalPrice)}
          </strong>
        </div>
      </Card>
      
      {groupOrder ? (
        <GroupOrderCard
          participantCount={groupOrder.participantCount}
          totalAmount={groupOrder.totalAmount}
          minimumAmount={groupOrder.minimumAmount}
        />
      ) : null}
    </Section>
  )
}
