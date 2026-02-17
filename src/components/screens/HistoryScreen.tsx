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
  
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'delivered':
        return { backgroundColor: 'var(--success)', color: 'var(--white)' }
      case 'cancelled':
        return { backgroundColor: 'var(--danger)', color: 'var(--white)' }
      case 'preparing':
      case 'ready':
        return { backgroundColor: 'var(--primary)', color: 'var(--white)' }
      case 'pending':
        return { backgroundColor: 'var(--surface-muted)', color: 'var(--text-secondary)' }
      default:
        return { backgroundColor: 'var(--surface-muted)', color: 'var(--text-secondary)' }
    }
  }
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return '\u23F3 Ожидает'
      case 'confirmed':
        return '\u2705 Подтверждён'
      case 'preparing':
        return '\uD83D\uDD25 Готовится'
      case 'ready':
        return '\uD83D\uDCE6 Готов'
      case 'delivered':
        return '\u2714\uFE0F Доставлен'
      case 'cancelled':
        return '\u2716 Отменён'
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
              <Badge style={getStatusStyle(order.status)}>
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
              <span className="price-summary-total">
                {formatPrice(order.totalPrice)}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  )
}
