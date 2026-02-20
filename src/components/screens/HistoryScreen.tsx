'use client'

import { Card, Badge, EmptyState } from '../ui'
import { useApp } from '../../store/AppContext'
import { formatPrice } from '../../lib/order-utils'

export function HistoryScreen() {
  const { orderHistory } = useApp()
  
  if (orderHistory.length === 0) {
    return (
      <EmptyState
        emoji="📋"
        title="Пока нет заказов"
        description="Ваши заказы будут отображаться здесь"
      />
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
    <div className="history-list" style={{ padding: '0 16px' }}>
      {orderHistory.map((order) => (
          <Card key={order.id}>
            <div className="row-between mb-8">
              <div className="text-strong">
                Заказ от {new Date(order.createdAt).toLocaleDateString('ru')}
              </div>
              <Badge style={getStatusStyle(order.status)}>
                {getStatusLabel(order.status)}
              </Badge>
            </div>
            
            <div className="muted mb-8">
              Доставка: {order.deliverySlot}
            </div>
            
            <div className="divider" />
            
            <div className="items-grid-sm">
              {order.items.map((item) => (
                <div
                  key={item.item.id}
                  className="row-between"
                >
                  <span>
                    {item.item.name} × {item.qty}
                  </span>
                  <span>{formatPrice(item.item.price * item.qty)}</span>
                </div>
              ))}
            </div>
            
            <div className="divider" />
            
            <div className="row-between">
              <strong>Итого:</strong>
              <span className="price-summary-total">
                {formatPrice(order.totalPrice)}
              </span>
            </div>
          </Card>
        ))}
    </div>
  )
}
