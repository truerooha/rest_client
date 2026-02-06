export type TgUser = {
  id: number
  firstName: string
  lastName?: string
  username?: string
  photoUrl?: string
  languageCode?: string
}

export type TgAuth = {
  source: 'telegram' | 'local'
  initData: string
  user: TgUser
  authDate?: number
  hash?: string
}

export type Building = {
  id: number
  name: string
  address: string
}

export type Restaurant = {
  id: number
  name: string
  cuisine: string
  rating: number
  etaMinutes: number
  priceLevel: string
  coverEmoji: string
  buildingIds: number[]
}

export type MenuItem = {
  id: number
  restaurantId: number
  name: string
  description: string
  price: number
  unit: string
  category: string
  emoji: string
}

export type CartItem = {
  item: MenuItem
  qty: number
}

export type DeliverySlot = {
  id: string
  time: string
  deadline: string
  isAvailable: boolean
}
