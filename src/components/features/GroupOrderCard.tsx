'use client'

import { Card } from '../ui'
import { ORDER_CONFIG } from '../../lib/config'

type GroupOrderCardProps = {
  participantCount: number
  totalAmount: number
  minimumAmount?: number
}

export function GroupOrderCard({
  participantCount,
  totalAmount,
  minimumAmount,
}: GroupOrderCardProps) {
  const remaining = minimumAmount ? Math.max(minimumAmount - totalAmount, 0) : 0
  
  return (
    <Card className="card-soft">
      <div style={{ fontWeight: 600 }}>Общий заказ офиса</div>
      <div className="order-muted" style={{ marginTop: 4 }}>
        Принять заказ до {ORDER_CONFIG.cancelDeadline}
      </div>
      <div className="divider" />
      <div className="order-summary">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <span className="order-muted">Участники</span>
          <strong>{participantCount}</strong>
        </div>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <span className="order-muted">Общая сумма</span>
          <strong>{totalAmount} ₽</strong>
        </div>
        {minimumAmount ? (
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span className="order-muted">До минималки</span>
            <strong>{remaining} ₽</strong>
          </div>
        ) : null}
      </div>
      <div className="order-muted" style={{ marginTop: 8 }}>
        Доставка будет бесплатной при достижении минимальной суммы
      </div>
    </Card>
  )
}
