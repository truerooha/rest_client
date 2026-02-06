'use client'

import { useState, useMemo } from 'react'
import { Section, StatusBanner } from '../ui'
import { CartSummary } from '../features/CartSummary'
import { GroupOrderCard } from '../features/GroupOrderCard'
import { OrderCheckout } from '../features/OrderCheckout'
import { useApp } from '../../store/AppContext'
import { isCancelDeadlinePassed } from '../../lib/order-utils'
import { ORDER_CONFIG } from '../../lib/config'

type OrderScreenProps = {
  onEdit: () => void
  onOrderCreated?: () => void
}

export function OrderScreen({ onEdit, onOrderCreated }: OrderScreenProps) {
  const { selectedSlot, cart, updateCartQty, clearCart, groupOrder, createOrder } = useApp()
  const [showCheckout, setShowCheckout] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  const isCancelAvailable = !isCancelDeadlinePassed()
  
  const orderSlotLabel = selectedSlot ? `Доставка в ${selectedSlot}` : 'Слот не выбран'
  
  const handleCheckout = () => {
    setShowCheckout(true)
  }
  
  const handleConfirmOrder = async () => {
    setIsProcessing(true)
    setErrorMessage(null)
    try {
      await createOrder()
      setShowCheckout(false)
      if (onOrderCreated) {
        onOrderCreated()
      }
    } catch (error) {
      setErrorMessage('Не удалось оформить заказ. Попробуйте ещё раз.')
    } finally {
      setIsProcessing(false)
    }
  }
  
  const handleCancelCheckout = () => {
    setShowCheckout(false)
  }
  
  return (
    <Section title="Ваш заказ" subtitle={orderSlotLabel}>
      <StatusBanner icon={isCancelAvailable ? '⏳' : '⚠️'} variant={isCancelAvailable ? 'default' : 'warning'}>
        {isCancelAvailable
          ? `Отмена доступна до ${ORDER_CONFIG.cancelDeadline}`
          : 'Дедлайн прошёл. Отмена и правки недоступны'}
      </StatusBanner>
      {errorMessage ? (
        <StatusBanner icon="❗" variant="error">
          {errorMessage}
        </StatusBanner>
      ) : null}
      <div className="order-grid">
        {showCheckout ? (
          <OrderCheckout
            cart={cart}
            selectedSlot={selectedSlot}
            participantCount={groupOrder?.participantCount ?? 1}
            onConfirm={handleConfirmOrder}
            onCancel={handleCancelCheckout}
            isProcessing={isProcessing}
          />
        ) : (
          <CartSummary
            cart={cart}
            onUpdateQty={updateCartQty}
            onEdit={onEdit}
            onCancel={clearCart}
            onCheckout={handleCheckout}
            isCancelAvailable={isCancelAvailable}
            participantCount={groupOrder?.participantCount ?? 1}
          />
        )}
        
        <GroupOrderCard
          participantCount={groupOrder?.participantCount ?? 1}
          totalAmount={groupOrder?.totalAmount ?? 0}
          minimumAmount={groupOrder?.minimumAmount}
        />
      </div>
    </Section>
  )
}
