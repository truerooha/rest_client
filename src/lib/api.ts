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
