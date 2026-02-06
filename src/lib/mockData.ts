import { Building, MenuItem, Restaurant } from './types'

export const mockBuildings: Building[] = [
  { id: 1, name: 'Коворкинг Central', address: 'ул. Мира, 10' },
  { id: 2, name: 'БЦ «Ритм»', address: 'пр. Ленина, 25' },
]

export const mockRestaurants: Restaurant[] = [
  {
    id: 1,
    name: 'Грамм',
    cuisine: 'Домашняя кухня',
    rating: 4.8,
    etaMinutes: 25,
    priceLevel: '₽₽',
    coverEmoji: '🍲',
    buildingIds: [1, 2],
  },
  {
    id: 2,
    name: 'Зелёная Тарелка',
    cuisine: 'Салаты и боулы',
    rating: 4.6,
    etaMinutes: 20,
    priceLevel: '₽₽',
    coverEmoji: '🥗',
    buildingIds: [1],
  },
  {
    id: 3,
    name: 'Мама Варит',
    cuisine: 'Супы и горячее',
    rating: 4.7,
    etaMinutes: 30,
    priceLevel: '₽₽₽',
    coverEmoji: '🍜',
    buildingIds: [2],
  },
]

export const mockMenuItems: MenuItem[] = [
  {
    id: 101,
    restaurantId: 1,
    name: 'Борщ с говядиной',
    description: 'Сметана, зелень',
    price: 320,
    unit: '350 г',
    category: 'Супы',
    emoji: '🥣',
  },
  {
    id: 102,
    restaurantId: 1,
    name: 'Куриная котлета',
    description: 'Пюре, соус',
    price: 410,
    unit: '320 г',
    category: 'Горячее',
    emoji: '🍗',
  },
  {
    id: 103,
    restaurantId: 1,
    name: 'Овощной салат',
    description: 'Свежие овощи',
    price: 220,
    unit: '200 г',
    category: 'Салаты',
    emoji: '🥗',
  },
  {
    id: 201,
    restaurantId: 2,
    name: 'Боул с лососем',
    description: 'Киноа, авокадо',
    price: 520,
    unit: '280 г',
    category: 'Боулы',
    emoji: '🥙',
  },
  {
    id: 202,
    restaurantId: 2,
    name: 'Салат с фетой',
    description: 'Огурцы, маслины',
    price: 260,
    unit: '190 г',
    category: 'Салаты',
    emoji: '🥬',
  },
  {
    id: 301,
    restaurantId: 3,
    name: 'Суп-лапша',
    description: 'Домашняя лапша',
    price: 290,
    unit: '300 г',
    category: 'Супы',
    emoji: '🍲',
  },
  {
    id: 302,
    restaurantId: 3,
    name: 'Тушёные овощи',
    description: 'Сезонные овощи',
    price: 340,
    unit: '260 г',
    category: 'Горячее',
    emoji: '🥕',
  },
]

export function filterRestaurantsByBuilding(
  restaurants: Restaurant[],
  buildingId: number,
): Restaurant[] {
  return restaurants.filter((restaurant) =>
    restaurant.buildingIds.includes(buildingId),
  )
}
