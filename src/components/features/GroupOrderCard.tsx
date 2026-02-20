'use client'

import { Card } from '../ui'
import { ORDER_CONFIG } from '../../lib/config'

type GroupOrderCardProps = {
  participantCount: number
  totalAmount: number
  minimumAmount?: number
  /** Дедлайн слота доставки (например "23:00"). Если не указан — используется ORDER_CONFIG.cancelDeadline */
  slotDeadline?: string
}

export function GroupOrderCard({
  participantCount,
  totalAmount,
  minimumAmount,
  slotDeadline,
}: GroupOrderCardProps) {
  const remaining = minimumAmount ? Math.max(minimumAmount - totalAmount, 0) : 0
  const deadline = slotDeadline ?? ORDER_CONFIG.cancelDeadline

  return (
    <Card className="card-soft">
      <div className="text-strong">Общий заказ офиса</div>
      <div className="order-muted mt-4">
        Заказ принимается до {deadline}
      </div>
      <div className="divider" />
      <div className="order-summary">
        <div className="row-between">
          <span className="order-muted">Участники</span>
          <strong>{participantCount}</strong>
        </div>
        <div className="row-between">
          <span className="order-muted">Общая сумма</span>
          <strong>{totalAmount} ₽</strong>
        </div>
        {minimumAmount ? (
          <div className="row-between">
            <span className="order-muted">До минималки</span>
            <strong>{remaining} ₽</strong>
          </div>
        ) : null}
      </div>
      <div className="order-muted mt-8">
        Доставка будет бесплатной при достижении минимальной суммы
      </div>
    </Card>
  )
}
