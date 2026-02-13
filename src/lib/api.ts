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
  lobbyDeadline: z.string().optional(),
  minParticipants: z.number().optional(),
  currentParticipants: z.number().optional(),
  deliveryPriceCents: z.number().optional(),
  isActivated: z.boolean().optional(),
  userInLobby: z.boolean().optional(),
})

const configSchema = z.object({
  timezone: z.string(),
})

export type AppConfig = z.infer<typeof configSchema>

export async function fetchConfig(apiUrl: string): Promise<AppConfig> {
  const res = await fetch(`${apiUrl}/api/config`)
  const json = (await res.json()) as ApiResponse<unknown>
  if (!res.ok || !json.success || !json.data) {
    return { timezone: 'Europe/Moscow' }
  }
  const parsed = configSchema.safeParse(json.data)
  return parsed.success ? parsed.data : { timezone: 'Europe/Moscow' }
}

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

export async function fetchDeliverySlots(
  apiUrl: string,
  options?: {
    buildingId?: number
    restaurantId?: number
    telegramUserId?: number
  },
): Promise<DeliverySlot[]> {
  const params = new URLSearchParams()
  if (options?.buildingId != null) params.set('buildingId', String(options.buildingId))
  if (options?.restaurantId != null) params.set('restaurantId', String(options.restaurantId))
  if (options?.telegramUserId != null)
    params.set('telegram_user_id', String(options.telegramUserId))
  const query = params.toString()
  const url = query ? `${apiUrl}/api/delivery-slots?${query}` : `${apiUrl}/api/delivery-slots`
  const res = await fetch(url)
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

export async function joinLobby(
  apiUrl: string,
  telegramUserId: number,
  buildingId: number,
  restaurantId: number,
  deliverySlot: string,
): Promise<void> {
  const res = await fetch(`${apiUrl}/api/lobby/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      telegram_user_id: telegramUserId,
      building_id: buildingId,
      restaurant_id: restaurantId,
      delivery_slot: deliverySlot,
    }),
  })
  const json = (await res.json()) as ApiResponse<unknown>
  if (!res.ok || !json.success) {
    throw new Error((json as { error?: string }).error ?? 'lobby_join_failed')
  }
}

export async function leaveLobby(
  apiUrl: string,
  telegramUserId: number,
  buildingId: number,
  restaurantId: number,
  deliverySlot: string,
): Promise<void> {
  const res = await fetch(`${apiUrl}/api/lobby/leave`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      telegram_user_id: telegramUserId,
      building_id: buildingId,
      restaurant_id: restaurantId,
      delivery_slot: deliverySlot,
    }),
  })
  const json = (await res.json()) as ApiResponse<unknown>
  if (!res.ok || !json.success) {
    throw new Error((json as { error?: string }).error ?? 'lobby_leave_failed')
  }
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

type ActiveOrderResponse = {
  id: number
  user_id: number
  restaurant_id: number
  building_id: number
  items: Array<{
    id: number
    name: string
    price: number
    quantity: number
  }>
  total_price: number
  delivery_slot: string
  status: string
  created_at: string
}

export async function fetchUserOrderSlots(
  apiUrl: string,
  telegramUserId: number,
  buildingId: number,
  restaurantId: number,
): Promise<string[]> {
  const params = new URLSearchParams({
    buildingId: String(buildingId),
    restaurantId: String(restaurantId),
  })
  const res = await fetch(
    `${apiUrl}/api/users/by-telegram/${telegramUserId}/order-slots?${params.toString()}`,
  )
  const json = (await res.json()) as ApiResponse<string[]>
  if (!res.ok || !json.success || !json.data) {
    return []
  }
  return json.data
}

export async function fetchActiveOrderForSlot(
  apiUrl: string,
  telegramUserId: number,
  deliverySlot: string,
  buildingId: number,
  restaurantId: number,
): Promise<ActiveOrderResponse | null> {
  const params = new URLSearchParams({
    deliverySlot,
    buildingId: String(buildingId),
    restaurantId: String(restaurantId),
  })
  const res = await fetch(
    `${apiUrl}/api/users/by-telegram/${telegramUserId}/active-order?${params.toString()}`,
  )
  const json = (await res.json()) as ApiResponse<ActiveOrderResponse | null>
  if (!res.ok || !json.success) {
    throw new Error(json.error ?? 'active_order_fetch_failed')
  }
  return json.data ?? null
}
