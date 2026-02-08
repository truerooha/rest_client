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
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🛒</div>
          <div style={{ fontWeight: 600 }}>Корзина пуста</div>
          <div className="muted" style={{ marginTop: 4 }}>
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
              <div style={{ fontWeight: 600 }}>{entry.item.name}</div>
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
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <span className="order-muted">Сумма</span>
          <span>{formatPrice(calculation.subtotal)}</span>
        </div>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <span className="order-muted">
            Скидка {ORDER_CONFIG.discountPercent}%
          </span>
          <span>-{formatPrice(calculation.discount)}</span>
        </div>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <span className="order-muted">
            Доставка{calculation.deliveryCost > 0 ? ' (резерв)' : ''}
            {calculation.deliveryCost > 0 ? (
              <span
                className="info-hint"
                title="Неиспользованная сумма доставки вернётся баллами после расчёта"
                aria-label="Неиспользованная сумма доставки вернётся баллами после расчёта"
              >
                ℹ️
              </span>
            ) : null}
          </span>
          <span>
            {calculation.deliveryCost > 0
              ? formatPrice(calculation.deliveryPerPerson)
              : 'Бесплатно'}
          </span>
        </div>
        <div className="row" style={{ justifyContent: 'space-between' }}>
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
          style={{ marginTop: 12 }}
        >
          Оформить заказ
        </PrimaryButton>
      ) : null}
    </Card>
  )
}
