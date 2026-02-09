'use client'

import { useMemo, useState } from 'react'
import type { CartItem } from '../../lib/types'
import { Card, PrimaryButton, SecondaryButton } from '../ui'
import { calculateOrderTotals, formatPrice } from '../../lib/order-utils'
import { ORDER_CONFIG } from '../../lib/config'

type OrderCheckoutProps = {
  cart: CartItem[]
  selectedSlot: string | null
  participantCount: number
  onConfirm: () => void | Promise<void>
  onCancel: () => void
  isProcessing?: boolean
}

export function OrderCheckout({
  cart,
  selectedSlot,
  participantCount,
  onConfirm,
  onCancel,
  isProcessing = false,
}: OrderCheckoutProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const calculation = useMemo(
    () => calculateOrderTotals(cart, participantCount),
    [cart, participantCount],
  )
  
  const handleConfirm = async () => {
    setIsSubmitting(true)
    try {
      await onConfirm()
    } finally {
      setIsSubmitting(false)
    }
  }
  
  if (cart.length === 0) {
    return null
  }
  
  return (
    <Card>
      <div style={{ fontWeight: 600, fontSize: 18 }}>Подтверждение заказа</div>
      <div className="muted" style={{ marginTop: 4 }}>
        Доставка в {selectedSlot}
      </div>
      
      <div className="divider" />
      
      <div className="price-summary">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <span className="order-muted">Сумма заказа</span>
          <span>{formatPrice(calculation.subtotal)}</span>
        </div>
        {calculation.discount > 0 ? (
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span className="order-muted">
              Скидка {ORDER_CONFIG.discountPercent}%
            </span>
            <span style={{ color: 'var(--success)' }}>
              -{formatPrice(calculation.discount)}
            </span>
          </div>
        ) : null}
        <div className="divider" />
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 600, fontSize: 16 }}>К оплате</span>
          <strong style={{ fontSize: 20, color: 'var(--primary)' }}>
            {formatPrice(calculation.total)}
          </strong>
        </div>
      </div>
      
      <div className="order-actions" style={{ marginTop: 16 }}>
        <SecondaryButton type="button" onClick={onCancel} disabled={isSubmitting}>
          Отменить
        </SecondaryButton>
        <PrimaryButton
          type="button"
          onClick={handleConfirm}
          disabled={isSubmitting || isProcessing}
        >
          {isSubmitting ? 'Оформление...' : 'Подтвердить'}
        </PrimaryButton>
      </div>
    </Card>
  )
}
