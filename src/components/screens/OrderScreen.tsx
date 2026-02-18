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
  apiUrl: string
  onOrderCreated?: () => void
}

export function OrderScreen({ apiUrl, onOrderCreated }: OrderScreenProps) {
  const {
    auth,
    apiUser,
    selectedSlot,
    deliverySlots,
    restaurants,
    selectedRestaurantId,
    selectedBuildingId,
    cart,
    updateCartQty,
    groupOrder,
    createOrder,
    appTimezone,
  } = useApp()
  const [showCheckout, setShowCheckout] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  const mapErrorMessage = (raw: string): string => {
    // Человекочитаемые сообщения вместо технических кодов ошибок
    switch (raw) {
      case 'draft_delete_failed':
        return 'Заказ оформлен, но не удалось очистить черновик. Это не влияет на ваш заказ, но корзина может отображаться некорректно.'
      case 'user_order_already_exists_for_slot':
        return 'У вас уже есть активный заказ на этот слот для выбранного ресторана и офиса. Повторный заказ недоступен.'
      case 'order_create_failed':
        return 'Не удалось создать заказ. Попробуйте ещё раз или обратитесь к администратору.'
      case 'pay_failed':
        return 'Не удалось оплатить заказ. Проверьте баланс и попробуйте ещё раз.'
      default:
        return raw
    }
  }
  
  const selectedSlotData = deliverySlots.find((slot) => slot.id === selectedSlot)
  const hasLobby = selectedSlotData?.lobbyDeadline != null
  const slotNotActivated = hasLobby && !selectedSlotData?.isActivated
  const isDeadlineOver = selectedSlotData
    ? isDeadlinePassed(selectedSlotData.deadline, appTimezone)
    : isCancelDeadlinePassed(appTimezone)
  const isCancelAvailable = !isDeadlineOver
  
  const missingReasons = [
    !auth ? 'авторизоваться в Telegram' : null,
    !apiUser ? 'дождаться загрузки профиля' : null,
    !selectedSlot ? 'выбрать слот' : null,
    !selectedRestaurantId ? 'выбрать ресторан' : null,
    !selectedBuildingId ? 'выбрать офис' : null,
    slotNotActivated ? 'дождаться активации слота' : null,
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
  
  const canCheckout = missingReasons.length === 0
  
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
      await createOrder(apiUrl)
      setShowCheckout(false)
      if (onOrderCreated) {
        onOrderCreated()
      }
    } catch (error) {
      const raw =
        error instanceof Error ? error.message : 'Не удалось оформить заказ. Попробуйте ещё раз.'
      const msg = mapErrorMessage(raw)
      setErrorMessage(msg)
    } finally {
      setIsProcessing(false)
    }
  }
  
  const handleCancelCheckout = () => {
    setShowCheckout(false)
  }
  
  return (
    <Section title="Ваш заказ" subtitle={orderSlotLabel}>
      <StatusBanner icon={isCancelAvailable ? '⏳' : '⚠️'} iconAccent={isCancelAvailable} variant={isCancelAvailable ? 'default' : 'warning'}>
        {isCancelAvailable
          ? `Заказ принимается до ${selectedSlotData?.deadline ?? ORDER_CONFIG.cancelDeadline}. Отмена возможна до этого времени`
          : 'Время приёма заказов прошло. Отмена и правки недоступны'}
      </StatusBanner>
      {!isCancelAvailable && (
        <p className="order-deadline-hint" role="status">
          Редактирование закрыто. Можно только оформить заказ.
        </p>
      )}
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
            sbpLink={restaurants.find(r => r.id === selectedRestaurantId)?.sbpLink}
          />
        ) : (
          <CartSummary
            cart={cart}
            onUpdateQty={updateCartQty}
            onCheckout={handleCheckout}
            isCheckoutAvailable={canCheckout}
            participantCount={groupOrder?.participantCount ?? 1}
          />
        )}
        
        <GroupOrderCard
          participantCount={groupOrder?.participantCount ?? 1}
          totalAmount={groupOrder?.totalAmount ?? 0}
          minimumAmount={groupOrder?.minimumAmount}
          slotDeadline={selectedSlotData?.deadline}
        />
      </div>
    </Section>
  )
}
