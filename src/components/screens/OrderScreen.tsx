'use client'

import { useState } from 'react'
import { Section, StatusBanner } from '../ui'
import { CartSummary } from '../features/CartSummary'
import { GroupOrderCard } from '../features/GroupOrderCard'
import { OrderCheckout } from '../features/OrderCheckout'
import { useApp } from '../../store/AppContext'
import { isCancelDeadlinePassed, isDeadlinePassed } from '../../lib/order-utils'
import { ORDER_CONFIG } from '../../lib/config'

type OrderScreenProps = {
  onEdit: () => void
  onOrderCreated?: () => void
}

export function OrderScreen({ onEdit, onOrderCreated }: OrderScreenProps) {
  const {
    auth,
    selectedSlot,
    deliverySlots,
    selectedRestaurantId,
    selectedBuildingId,
    cart,
    updateCartQty,
    clearCart,
    groupOrder,
    createOrder,
  } = useApp()
  const [showCheckout, setShowCheckout] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  const selectedSlotData = deliverySlots.find((slot) => slot.id === selectedSlot)
  const isDeadlineOver = selectedSlotData
    ? isDeadlinePassed(selectedSlotData.deadline)
    : isCancelDeadlinePassed()
  const isCancelAvailable = !isDeadlineOver
  
  const missingReasons = [
    !auth ? 'авторизоваться в Telegram' : null,
    !selectedSlot ? 'выбрать слот' : null,
    !selectedRestaurantId ? 'выбрать ресторан' : null,
    !selectedBuildingId ? 'выбрать офис' : null,
  ].filter(Boolean) as string[]
  
  const joinReasons = (reasons: string[]) => {
    if (reasons.length === 1) {
      return reasons[0]
    }
    if (reasons.length === 2) {
      return `${reasons[0]} и ${reasons[1]}`
    }
    return `${reasons.slice(0, -1).join(', ')} и ${reasons[reasons.length - 1]}`
  }
  
  const canCheckout = missingReasons.length === 0 && isCancelAvailable
  
  const orderSlotLabel = selectedSlot ? `Доставка в ${selectedSlot}` : 'Слот не выбран'
  
  const handleCheckout = () => {
    if (!canCheckout) {
      return
    }
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
          ? `Отмена доступна до ${selectedSlotData?.deadline ?? ORDER_CONFIG.cancelDeadline}`
          : 'Дедлайн прошёл. Отмена и правки недоступны'}
      </StatusBanner>
      {missingReasons.length > 0 ? (
        <StatusBanner icon="ℹ️" variant="warning">
          Чтобы оформить заказ, нужно {joinReasons(missingReasons)}
        </StatusBanner>
      ) : null}
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
            isCheckoutAvailable={canCheckout}
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
