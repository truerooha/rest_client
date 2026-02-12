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

/** Текущее время в минутах (часы*60+минуты) в заданном часовом поясе */
function getNowMinutesInTimezone(timezone: string): number {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }).formatToParts(new Date())
  const hour = parseInt(parts.find((p) => p.type === 'hour')?.value ?? '0', 10)
  const minute = parseInt(parts.find((p) => p.type === 'minute')?.value ?? '0', 10)
  return hour * 60 + minute
}

/** Проверяет, прошёл ли дедлайн отмены (10:30) в заданном часовом поясе */
export function isCancelDeadlinePassed(timezone: string = 'Europe/Moscow'): boolean {
  const [hours, minutes] = ORDER_CONFIG.cancelDeadline.split(':').map(Number)
  const deadlineMinutes = hours * 60 + minutes
  return getNowMinutesInTimezone(timezone) > deadlineMinutes
}

/** Проверяет, прошёл ли дедлайн слота в заданном часовом поясе */
export function isDeadlinePassed(deadlineTime: string, timezone: string = 'Europe/Moscow'): boolean {
  const [hours, minutes] = deadlineTime.split(':').map(Number)
  const deadlineMinutes = hours * 60 + minutes
  return getNowMinutesInTimezone(timezone) > deadlineMinutes
}
