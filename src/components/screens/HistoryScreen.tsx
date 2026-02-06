'use client'

import { Section, Card, Badge, EmptyState } from '../ui'
import { useApp } from '../../store/AppContext'
import { formatPrice } from '../../lib/order-utils'

export function HistoryScreen() {
  const { orderHistory } = useApp()
  
  if (orderHistory.length === 0) {
    return (
      <Section title="История заказов">
        <EmptyState
          emoji="📋"
          title="Пока нет заказов"
          description="Ваши заказы будут отображаться здесь"
        />
      </Section>
    )
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'delivered':
        return 'var(--success)'
      case 'cancelled':
        return 'var(--orange)'
      case 'preparing':
      case 'ready':
        return 'var(--primary)'
      default:
        return 'var(--gray)'
    }
  }
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Ожидает'
      case 'confirmed':
        return 'Подтверждён'
      case 'preparing':
        return 'Готовится'
      case 'ready':
        return 'Готов'
      case 'delivered':
        return 'Доставлен'
      case 'cancelled':
        return 'Отменён'
      default:
        return status
    }
  }
  
  return (
    <Section title="История заказов">
      <div style={{ display: 'grid', gap: 12 }}>
        {orderHistory.map((order) => (
          <Card key={order.id}>
            <div
              className="row"
              style={{ justifyContent: 'space-between', marginBottom: 8 }}
            >
              <div style={{ fontWeight: 600 }}>
                Заказ от {new Date(order.createdAt).toLocaleDateString('ru')}
              </div>
              <Badge
                style={{
                  backgroundColor: getStatusColor(order.status),
                  color: 'white',
                }}
              >
                {getStatusLabel(order.status)}
              </Badge>
            </div>
            
            <div className="muted" style={{ marginBottom: 8 }}>
              Доставка: {order.deliverySlot}
            </div>
            
            <div className="divider" />
            
            <div style={{ display: 'grid', gap: 4, fontSize: 14 }}>
              {order.items.map((item) => (
                <div
                  key={item.item.id}
                  className="row"
                  style={{ justifyContent: 'space-between' }}
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
              <strong style={{ color: 'var(--primary)' }}>
                {formatPrice(order.totalPrice)}
              </strong>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  )
}
