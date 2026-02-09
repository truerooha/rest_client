import type { CartItem } from './types'
import { ORDER_CONFIG } from './config'

type OrderCalculation = {
  subtotal: number
  discount: number
  deliveryCost: number
  total: number
  deliveryPerPerson: number
}

export function calculateOrderTotals(
  cart: CartItem[],
  participantCount: number = 1,
): OrderCalculation {
  const subtotal = cart.reduce((sum, entry) => sum + entry.item.price * entry.qty, 0)
  const discount = Math.round((subtotal * ORDER_CONFIG.discountPercent) / 100)
  const totalAfterDiscount = Math.max(subtotal - discount, 0)

  // В текущей модели MVP доставка не распределяется по людям,
  // считаем только свою сумму с учётом скидки, без любых наценок за доставку.
  const deliveryCost = 0
  const deliveryPerPerson = 0
  const total = totalAfterDiscount
  
  return {
    subtotal,
    discount,
    deliveryCost,
    total,
    deliveryPerPerson,
  }
}

export function formatPrice(price: number): string {
  return `${price} ₽`
}

export function isCancelDeadlinePassed(): boolean {
  const [hours, minutes] = ORDER_CONFIG.cancelDeadline.split(':').map(Number)
  const now = new Date()
  const deadline = new Date()
  deadline.setHours(hours, minutes, 0, 0)
  return now.getTime() > deadline.getTime()
}

export function isDeadlinePassed(deadlineTime: string): boolean {
  const [hours, minutes] = deadlineTime.split(':').map(Number)
  const now = new Date()
  const deadline = new Date()
  deadline.setHours(hours, minutes, 0, 0)
  return now.getTime() > deadline.getTime()
}
