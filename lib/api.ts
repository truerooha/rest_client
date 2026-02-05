// API клиент для взаимодействия с backend

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

export interface Building {
  id: number
  name: string
  address: string
  created_at: string
}

export interface Restaurant {
  id: number
  name: string
  chat_id: number
  created_at: string
}

export interface MenuItem {
  id: number
  restaurant_id: number
  name: string
  price: number
  description?: string
  category?: string
  is_breakfast: boolean
  is_available: boolean
  created_at: string
}

export interface User {
  id: number
  telegram_user_id: number
  username?: string
  first_name?: string
  last_name?: string
  building_id?: number
  created_at: string
}

export interface Order {
  id: number
  user_id: number
  restaurant_id: number
  building_id: number
  items: OrderItem[]
  total_price: number
  delivery_slot: string
  status: string
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: number
  name: string
  price: number
  quantity: number
}

// API методы

export async function fetchBuildings(): Promise<Building[]> {
  const res = await fetch(`${API_URL}/buildings`)
  const data = await res.json()
  return data.data
}

export async function fetchRestaurants(buildingId: number): Promise<Restaurant[]> {
  const res = await fetch(`${API_URL}/restaurants?buildingId=${buildingId}`)
  const data = await res.json()
  return data.data
}

export async function fetchMenu(restaurantId: number): Promise<{ items: MenuItem[], grouped: Record<string, MenuItem[]> }> {
  const res = await fetch(`${API_URL}/menu/${restaurantId}`)
  const data = await res.json()
  return data.data
}

export async function fetchUser(telegramId: number): Promise<User | null> {
  try {
    const res = await fetch(`${API_URL}/user/${telegramId}`)
    const data = await res.json()
    return data.success ? data.data : null
  } catch {
    return null
  }
}

export async function createOrUpdateUser(user: {
  telegram_user_id: number
  username?: string
  first_name?: string
  last_name?: string
  building_id?: number
}): Promise<User> {
  const res = await fetch(`${API_URL}/user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  })
  const data = await res.json()
  return data.data
}

export async function updateUserBuilding(telegramId: number, buildingId: number): Promise<User> {
  const res = await fetch(`${API_URL}/user/${telegramId}/building`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ building_id: buildingId }),
  })
  const data = await res.json()
  return data.data
}

export async function createOrder(order: {
  user_id: number
  restaurant_id: number
  building_id: number
  items: OrderItem[]
  total_price: number
  delivery_slot: string
}): Promise<Order> {
  const res = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  })
  const data = await res.json()
  return data.data
}

export async function fetchOrders(userId: number): Promise<Order[]> {
  const res = await fetch(`${API_URL}/orders/${userId}`)
  const data = await res.json()
  return data.data
}
