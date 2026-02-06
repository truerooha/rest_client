import rawData from '../../../server/test-data/mock_data.json'
import { Building, MenuItem, Restaurant } from './types'

type RawData = {
  restaurants: Array<{
    id: number
    name: string
    chat_id: number
  }>
  buildings: Array<{
    id: number
    name: string
    address: string
  }>
  restaurant_buildings: Array<{
    id: number
    restaurant_id: number
    building_id: number
  }>
  menu_items: Array<{
    id: number
    restaurant_id: number
    name: string
    price: number
    description?: string | null
    category?: string | null
    is_available: number
  }>
}

const data = rawData as RawData

const categoryEmoji: Record<string, string> = {
  Супы: '🥣',
  'Горячие блюда': '🍲',
  Завтраки: '🥐',
  Салаты: '🥗',
  Боулы: '🥙',
}

export const testBuildings: Building[] = data.buildings.map((building) => ({
  id: building.id,
  name: building.name,
  address: building.address,
}))

const restaurantBuildingMap = data.restaurant_buildings.reduce<
  Record<number, number[]>
>((acc, link) => {
  const existing = acc[link.restaurant_id] ?? []
  acc[link.restaurant_id] = [...existing, link.building_id]
  return acc
}, {})

export const testRestaurants: Restaurant[] = data.restaurants.map(
  (restaurant) => ({
    id: restaurant.id,
    name: restaurant.name,
    cuisine: 'Домашняя кухня',
    rating: 4.6,
    etaMinutes: 25,
    priceLevel: '₽₽',
    coverEmoji: '🍽️',
    buildingIds: restaurantBuildingMap[restaurant.id] ?? [],
  }),
)

export const testMenuItems: MenuItem[] = data.menu_items
  .filter((item) => item.is_available === 1)
  .map((item) => ({
    id: item.id,
    restaurantId: item.restaurant_id,
    name: item.name,
    description: item.description ?? 'Описание появится позже',
    price: Math.round(item.price),
    unit: '1 порция',
    category: item.category ?? 'Другое',
    emoji: categoryEmoji[item.category ?? ''] ?? '🍽️',
  }))

export function getTestDataForBuilding(buildingId: number) {
  const restaurants = testRestaurants.filter((restaurant) =>
    restaurant.buildingIds.includes(buildingId),
  )
  const restaurantIds = restaurants.map((restaurant) => restaurant.id)
  const menuItems = testMenuItems.filter((item) =>
    restaurantIds.includes(item.restaurantId),
  )
  return { restaurants, menuItems }
}
