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
  sbpLink?: string
}

export function OrderCheckout({
  cart,
  selectedSlot,
  participantCount,
  onConfirm,
  onCancel,
  isProcessing = false,
  sbpLink,
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

  const handleOpenSbp = () => {
    if (sbpLink) {
      window.open(sbpLink, '_blank')
    }
  }

  if (cart.length === 0) {
    return null
  }

  const hasSbp = Boolean(sbpLink)

  return (
    <Card>
      <div className="card-title-inline">
        {hasSbp ? 'Оплата по СБП' : 'Подтверждение заказа'}
      </div>
      <div className="muted mt-4">
        Доставка в {selectedSlot}
      </div>

      <div className="divider" />

      <div className="price-summary">
        <div className="row-between">
          <span className="order-muted">Сумма заказа</span>
          <span>{formatPrice(calculation.subtotal)}</span>
        </div>
        {calculation.discount > 0 ? (
          <div className="row-between">
            <span className="order-muted">
              Скидка {ORDER_CONFIG.discountPercent}%
            </span>
            <span className="discount-line">
              -{formatPrice(calculation.discount)}
            </span>
          </div>
        ) : null}
        {calculation.serviceFee > 0 ? (
          <div className="row-between">
            <span className="order-muted">
              Сервисный сбор
            </span>
            <span className="service-fee-line">
              +{formatPrice(calculation.serviceFee)}
            </span>
          </div>
        ) : null}
        <div className="divider" />
        <div className="row-between">
          <span className="checkout-label">К оплате</span>
          <strong className="checkout-total">
            {formatPrice(calculation.total)}
          </strong>
        </div>
      </div>

      {hasSbp ? (
        <>
          <div className="divider" />
          <StatusBanner icon="📋" variant="default">
            <ol className="sbp-instructions">
              <li>Нажмите «Оплатить по СБП»</li>
              <li>Оплатите в приложении банка</li>
              <li>Вернитесь и подтвердите</li>
            </ol>
          </StatusBanner>
          <PrimaryButton type="button" onClick={handleOpenSbp}>
            Оплатить по СБП
          </PrimaryButton>
          <div className="divider" />
          <div className="order-actions">
            <SecondaryButton type="button" onClick={onCancel} disabled={isSubmitting}>
              Отменить
            </SecondaryButton>
            <PrimaryButton
              type="button"
              onClick={handleConfirm}
              disabled={isSubmitting || isProcessing}
            >
              {isSubmitting ? 'Оформление...' : 'Я оплатил(а)'}
            </PrimaryButton>
          </div>
        </>
      ) : (
        <>
          <div className="divider" />
          <StatusBanner icon="⚠️" variant="warning">
            Оплата по СБП временно недоступна
          </StatusBanner>
          <div className="order-actions mt-8">
            <SecondaryButton type="button" onClick={onCancel} disabled={isSubmitting}>
              Отменить
            </SecondaryButton>
            <PrimaryButton
              type="button"
              onClick={handleConfirm}
              disabled={isSubmitting || isProcessing}
            >
              {isSubmitting ? 'Оформление...' : 'Подтвердить заказ'}
            </PrimaryButton>
          </div>
        </>
      )}
    </Card>
  )
}
