import { Building, DeliverySlot, MenuItem, Restaurant } from './types'
import { z } from 'zod'

type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
}

type ApiBuilding = {
  id: number
  name: string
  address: string
}

type ApiRestaurant = {
  id: number
  name: string
  chat_id?: number
}

type ApiMenuItem = {
  id: number
  restaurant_id: number
  name: string
  price: number
  description?: string | null
  category?: string | null
}

const slotSchema = z.object({
  id: z.string(),
  time: z.string(),
  deadline: z.string(),
  isAvailable: z.boolean(),
})

const categoryEmoji: Record<string, string> = {
  Супы: '🥣',
  Горячее: '🍲',
  Салаты: '🥗',
  Боулы: '🥙',
  Закуски: '🥪',
  Напитки: '🥤',
}

export async function fetchBuildings(apiUrl: string): Promise<Building[]> {
  const res = await fetch(`${apiUrl}/api/buildings`)
  const json = (await res.json()) as ApiResponse<ApiBuilding[]>
  if (!res.ok || !json.success || !json.data) {
    throw new Error('buildings_fetch_failed')
  }
  return json.data.map((building) => ({
    id: building.id,
    name: building.name,
    address: building.address,
  }))
}

export async function fetchRestaurants(
  apiUrl: string,
  buildingId: number,
): Promise<Restaurant[]> {
  const res = await fetch(`${apiUrl}/api/restaurants?buildingId=${buildingId}`)
  const json = (await res.json()) as ApiResponse<ApiRestaurant[]>
  if (!res.ok || !json.success || !json.data) {
    throw new Error('restaurants_fetch_failed')
  }
  return json.data.map((restaurant) => ({
    id: restaurant.id,
    name: restaurant.name,
    cuisine: 'Домашняя кухня',
    rating: 4.7,
    etaMinutes: 25,
    priceLevel: '₽₽',
    coverEmoji: '🍽️',
    buildingIds: [buildingId],
  }))
}

export async function fetchMenu(
  apiUrl: string,
  restaurantId: number,
): Promise<MenuItem[]> {
  const res = await fetch(`${apiUrl}/api/menu/${restaurantId}`)
  const json = (await res.json()) as ApiResponse<{ items: ApiMenuItem[] }>
  if (!res.ok || !json.success || !json.data) {
    throw new Error('menu_fetch_failed')
  }
  return json.data.items.map((item) => ({
    id: item.id,
    restaurantId: item.restaurant_id,
    name: item.name,
    description: item.description ?? 'Описание появится позже',
    price: Math.round(item.price),
    unit: '1 порция',
    category: item.category ?? 'Другое',
    emoji: categoryEmoji[item.category ?? ''] ?? '🍽️',
  }))
}

export async function fetchDeliverySlots(apiUrl: string): Promise<DeliverySlot[]> {
  const res = await fetch(`${apiUrl}/api/delivery-slots`)
  const json = (await res.json()) as ApiResponse<unknown>
  if (!res.ok || !json.success || !json.data) {
    throw new Error('delivery_slots_fetch_failed')
  }

  const parsed = z.array(slotSchema).safeParse(json.data)
  if (!parsed.success) {
    throw new Error('delivery_slots_invalid')
  }
  return parsed.data
}

type CreateOrderPayload = {
  userId: number
  restaurantId: number
  buildingId: number
  items: Array<{
    id: number
    name: string
    price: number
    quantity: number
  }>
  totalPrice: number
  deliverySlot: string
}

type CreateOrderResponse = {
  id: number
  status: string
  message?: string
}

export async function createOrder(
  apiUrl: string,
  payload: CreateOrderPayload,
): Promise<CreateOrderResponse> {
  const res = await fetch(`${apiUrl}/api/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const json = (await res.json()) as ApiResponse<CreateOrderResponse>
  if (!res.ok || !json.success || !json.data) {
    throw new Error(json.error ?? 'order_create_failed')
  }

  return json.data
}

type ApiUser = {
  id: number
  telegram_user_id: number
  username?: string | null
  building_id?: number | null
}

export async function fetchUserOrCreate(
  apiUrl: string,
  telegramUserId: number,
  data: { username?: string; first_name?: string; last_name?: string; building_id?: number },
): Promise<ApiUser> {
  const res = await fetch(`${apiUrl}/api/user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      telegram_user_id: telegramUserId,
      username: data.username,
      first_name: data.first_name,
      last_name: data.last_name,
      building_id: data.building_id,
    }),
  })
  const json = (await res.json()) as ApiResponse<ApiUser>
  if (!res.ok || !json.success || !json.data) {
    throw new Error(json.error ?? 'user_sync_failed')
  }
  return json.data
}

export async function getDraft(
  apiUrl: string,
  telegramUserId: number,
): Promise<{
  delivery_slot: string | null
  restaurant_id: number | null
  building_id: number | null
  items: Array<{ id: number; name: string; price: number; quantity?: number }>
} | null> {
  const res = await fetch(`${apiUrl}/api/draft?telegram_user_id=${telegramUserId}`)
  const json = (await res.json()) as ApiResponse<{
    delivery_slot: string | null
    restaurant_id: number | null
    building_id: number | null
    items: Array<{ id: number; name: string; price: number; quantity?: number }>
  } | null>
  if (!res.ok || !json.success) {
    throw new Error('draft_fetch_failed')
  }
  return json.data ?? null
}

export async function putDraft(
  apiUrl: string,
  telegramUserId: number,
  draft: {
    delivery_slot: string | null
    restaurant_id: number | null
    building_id: number | null
    items: Array<{ id: number; name: string; price: number; quantity: number }>
  },
): Promise<void> {
  const res = await fetch(`${apiUrl}/api/draft`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      telegram_user_id: telegramUserId,
      delivery_slot: draft.delivery_slot,
      restaurant_id: draft.restaurant_id,
      building_id: draft.building_id,
      items: draft.items,
    }),
  })
  const json = (await res.json()) as ApiResponse<unknown>
  if (!res.ok || !json.success) {
    throw new Error('draft_save_failed')
  }
}

export async function deleteDraft(apiUrl: string, telegramUserId: number): Promise<void> {
  const res = await fetch(`${apiUrl}/api/draft?telegram_user_id=${telegramUserId}`, {
    method: 'DELETE',
  })
  const json = (await res.json()) as ApiResponse<unknown>
  if (!res.ok || !json.success) {
    throw new Error('draft_delete_failed')
  }
}

export async function payOrder(
  apiUrl: string,
  orderId: number,
  telegramUserId: number,
): Promise<{ id: number; status: string }> {
  const res = await fetch(`${apiUrl}/api/orders/${orderId}/pay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ telegram_user_id: telegramUserId }),
  })
  const json = (await res.json()) as ApiResponse<{ id: number; status: string }>
  if (!res.ok || !json.success || !json.data) {
    throw new Error(json.error ?? 'pay_failed')
  }
  return json.data
}

export async function cancelOrderApi(
  apiUrl: string,
  orderId: number,
  telegramUserId: number,
): Promise<void> {
  const res = await fetch(
    `${apiUrl}/api/orders/${orderId}?telegram_user_id=${telegramUserId}`,
    { method: 'DELETE' },
  )
  const json = (await res.json()) as ApiResponse<unknown>
  if (!res.ok || !json.success) {
    throw new Error((json as { error?: string }).error ?? 'cancel_failed')
  }
}

type GroupOrderResponse = {
  deliverySlot: string
  buildingId: number
  restaurantId: number
  participantCount: number
  totalAmount: number
  minimumAmount?: number
  orders: Array<{
    id: number
    user_id: number
    total_price: number
    status: string
    items: unknown
  }>
}

export async function fetchGroupOrder(
  apiUrl: string,
  deliverySlot: string,
  buildingId: number,
  restaurantId: number,
): Promise<GroupOrderResponse> {
  const res = await fetch(
    `${apiUrl}/api/group-orders?deliverySlot=${encodeURIComponent(deliverySlot)}&buildingId=${buildingId}&restaurantId=${restaurantId}`,
  )
  const json = (await res.json()) as ApiResponse<GroupOrderResponse>
  if (!res.ok || !json.success || !json.data) {
    throw new Error('group_order_fetch_failed')
  }
  return json.data
}
