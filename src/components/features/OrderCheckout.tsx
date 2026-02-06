'use client'

import { useMemo, useState } from 'react'
import type { CartItem } from '../../lib/types'
import { Card, PrimaryButton, SecondaryButton, StatusBanner } from '../ui'
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
        
        {calculation.deliveryCost > 0 ? (
          <>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span className="order-muted">Доставка (всего)</span>
              <span>{formatPrice(calculation.deliveryCost)}</span>
            </div>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span className="order-muted">
                Ваша часть доставки ({participantCount} чел.)
              </span>
              <span>{formatPrice(calculation.deliveryPerPerson)}</span>
            </div>
          </>
        ) : (
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span className="order-muted">Доставка</span>
            <span style={{ color: 'var(--success)' }}>Бесплатно</span>
          </div>
        )}
        
        <div className="divider" />
        
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 600, fontSize: 16 }}>К оплате</span>
          <strong style={{ fontSize: 20, color: 'var(--primary)' }}>
            {formatPrice(calculation.total)}
          </strong>
        </div>
      </div>
      
      {calculation.deliveryCost > 0 &&
      calculation.subtotal - calculation.discount <
        ORDER_CONFIG.minOrderForFreeDelivery ? (
        <div style={{ marginTop: 8 }}>
          <StatusBanner icon="💡">
            Закажите ещё на{' '}
            {formatPrice(
              ORDER_CONFIG.minOrderForFreeDelivery -
                (calculation.subtotal - calculation.discount),
            )}{' '}
            для бесплатной доставки
          </StatusBanner>
        </div>
      ) : null}
      
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
