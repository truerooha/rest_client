'use client'

import type { CartItem } from '../../lib/types'
import { Card, Stepper, PrimaryButton } from '../ui'
import { ORDER_CONFIG } from '../../lib/config'
import { calculateOrderTotals, formatPrice as formatPriceUtil } from '../../lib/order-utils'

type CartSummaryProps = {
  cart: CartItem[]
  onUpdateQty: (itemId: number, delta: number) => void
  onCheckout?: () => void
  isCheckoutAvailable: boolean
  participantCount?: number
}

export function CartSummary({
  cart,
  onUpdateQty,
  onCheckout,
  isCheckoutAvailable,
  participantCount = 1,
}: CartSummaryProps) {
  const calculation = calculateOrderTotals(cart, participantCount)
  const formatPrice = formatPriceUtil
  
  if (cart.length === 0) {
    return (
      <Card>
        <div className="empty-card">
          <div className="empty-card-icon-lg">🛒</div>
          <div className="text-strong">Корзина пуста</div>
          <div className="muted mt-4">
            Добавьте блюда из меню
          </div>
        </div>
      </Card>
    )
  }
  
  return (
    <Card>
      <div className="order-summary">
        {cart.map((entry) => (
          <div key={entry.item.id} className="cart-item">
            <div className="product-image">{entry.item.emoji}</div>
            <div>
              <div className="text-strong">{entry.item.name}</div>
              <div className="muted">{entry.item.unit}</div>
              <div className="price">{formatPrice(entry.item.price)}</div>
            </div>
            <Stepper
              value={entry.qty}
              onDecrease={() => onUpdateQty(entry.item.id, -1)}
              onIncrease={() => onUpdateQty(entry.item.id, 1)}
            />
          </div>
        ))}
      </div>
      <div className="divider" />
      <div className="price-summary">
        <div className="row-between">
          <span className="order-muted">Сумма</span>
          <span>{formatPrice(calculation.subtotal)}</span>
        </div>
        <div className="row-between">
          <span className="order-muted">
            Скидка {ORDER_CONFIG.discountPercent}%
          </span>
          <span>-{formatPrice(calculation.discount)}</span>
        </div>
        <div className="row-between">
          <span className="order-muted">К оплате</span>
          <span className="price-summary-total">{formatPrice(calculation.total)}</span>
        </div>
      </div>
      <div className="divider" />
      {onCheckout ? (
        <PrimaryButton
          type="button"
          onClick={onCheckout}
          disabled={!isCheckoutAvailable}
          className="mt-12"
        >
          Оформить заказ
        </PrimaryButton>
      ) : null}
    </Card>
  )
}
