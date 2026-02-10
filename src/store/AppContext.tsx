"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react"
import type {
  TgAuth,
  Building,
  Restaurant,
  MenuItem,
  CartItem,
  DeliverySlot,
} from "../lib/types"
import {
  fetchUserOrCreate,
  getDraft,
  deleteDraft,
  createOrder as createOrderApi,
  payOrder,
  cancelOrderApi,
} from "../lib/api"
import { isDeadlinePassed, calculateOrderTotals } from "../lib/order-utils"

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'

export type Order = {
  id: string
  userId: number
  restaurantId: number
  buildingId: number
  items: CartItem[]
  totalPrice: number
  deliverySlot: string
  status: OrderStatus
  createdAt: string
}

type GroupOrder = {
  deliverySlot: string
  buildingId: number
  restaurantId: number
  participantCount: number
  totalAmount: number
  minimumAmount: number
  orders: Order[]
}

type ApiState = 'idle' | 'loading' | 'success' | 'error'

type AppState = {
  // Auth
  auth: TgAuth | null
  setAuth: (auth: TgAuth | null) => void
  apiUser: { id: number } | null
  setApiUser: (u: { id: number } | null) => void
  
  // Data
  buildings: Building[]
  restaurants: Restaurant[]
  menuItems: MenuItem[]
  deliverySlots: DeliverySlot[]
  
  // Selection
  selectedBuildingId: number | null
  selectedRestaurantId: number | null
  selectedSlot: string | null
  setSelectedBuildingId: (id: number) => void
  setSelectedRestaurantId: (id: number) => void
  setSelectedSlot: (slot: string | null) => void
  
  // Cart
  cart: CartItem[]
  addToCart: (item: MenuItem) => void
  updateCartQty: (itemId: number, delta: number) => void
  clearCart: () => void
  
  // Orders
  currentOrder: Order | null
  orderHistory: Order[]
  groupOrder: GroupOrder | null
  
  // API State
  apiState: ApiState
  apiError: string | null
  
  // Actions
  loadData: (apiUrl: string) => Promise<void>
  createOrder: (apiUrl: string) => Promise<Order>
  cancelOrder: (apiUrl: string, orderId: string) => Promise<void>
  
  // Setters
  setBuildings: (buildings: Building[]) => void
  setRestaurants: (restaurants: Restaurant[]) => void
  setMenuItems: (menuItems: MenuItem[]) => void
  setDeliverySlots: (slots: DeliverySlot[]) => void
  setApiState: (state: ApiState) => void
  setApiError: (error: string | null) => void
  setGroupOrder: (groupOrder: GroupOrder | null) => void
  setCurrentOrder: (order: Order | null) => void
}

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<TgAuth | null>(null)
  const [apiUser, setApiUser] = useState<{ id: number } | null>(null)
  const [buildings, setBuildings] = useState<Building[]>([])
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [deliverySlots, setDeliverySlots] = useState<DeliverySlot[]>([])

  const [selectedBuildingId, setSelectedBuildingId] = useState<number | null>(null)
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)

  const [cart, setCart] = useState<CartItem[]>([])
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
  const [orderHistory, setOrderHistory] = useState<Order[]>([])
  const [groupOrder, setGroupOrder] = useState<GroupOrder | null>(null)

  const [apiState, setApiState] = useState<ApiState>('idle')
  const [apiError, setApiError] = useState<string | null>(null)
  
  const addToCart = useCallback((item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((entry) => entry.item.id === item.id)
      if (existing) {
        return prev.map((entry) =>
          entry.item.id === item.id
            ? { ...entry, qty: entry.qty + 1 }
            : entry,
        )
      }
      return [...prev, { item, qty: 1 }]
    })
  }, [])
  
  const updateCartQty = useCallback((itemId: number, delta: number) => {
    setCart((prev) => {
      const updated = prev
        .map((entry) =>
          entry.item.id === itemId
            ? { ...entry, qty: entry.qty + delta }
            : entry,
        )
        .filter((entry) => entry.qty > 0)
      return updated
    })
  }, [])
  
  const clearCart = useCallback(() => {
    setCart([])
  }, [])
  
  const loadData = useCallback(
    async (apiUrl: string) => {
      if (!auth) return
      setApiError(null)
      try {
        const user = await fetchUserOrCreate(apiUrl, auth.user.id, {
          username: auth.user.username,
          first_name: auth.user.firstName,
          last_name: auth.user.lastName,
          building_id: selectedBuildingId ?? undefined,
        })
        setApiUser({ id: user.id })
        const draft = await getDraft(apiUrl, auth.user.id)
        if (draft) {
          if (draft.building_id != null) setSelectedBuildingId(draft.building_id)
          if (draft.restaurant_id != null) setSelectedRestaurantId(draft.restaurant_id)
          const slotDeadline =
            deliverySlots.find((s) => s.id === draft.delivery_slot)?.deadline
          if (draft.delivery_slot && slotDeadline && isDeadlinePassed(slotDeadline)) {
            setSelectedSlot(null)
          } else if (draft.delivery_slot) {
            setSelectedSlot(draft.delivery_slot)
          }
          if (draft.items?.length) {
            const restored: CartItem[] = draft.items.map((row) => ({
              item: {
                id: row.id,
                name: row.name,
                price: row.price,
                description: '',
                unit: '1 порция',
                category: 'Другое',
                emoji: '🍽️',
                restaurantId: draft.restaurant_id ?? 0,
              },
              qty: row.quantity ?? 1,
            }))
            setCart(restored)
          }
        }
      } catch {
        setApiError('Не удалось загрузить данные пользователя')
      }
    },
    [
      auth,
      selectedBuildingId,
      deliverySlots,
    ],
  )

  const createOrder = useCallback(
    async (apiUrl: string): Promise<Order> => {
      const missing: string[] = []
      if (!auth) missing.push('авторизация')
      if (!apiUser) missing.push('профиль пользователя')
      if (!selectedSlot) missing.push('слот доставки')
      if (!selectedRestaurantId) missing.push('ресторан')
      if (!selectedBuildingId) missing.push('офис')
      if (cart.length === 0) missing.push('позиции в корзине')

      if (missing.length > 0) {
        throw new Error(`Не хватает данных для заказа: ${missing.join(', ')}`)
      }

      // Дополнительная защита от null для TypeScript и рантайма:
      if (!auth) {
        throw new Error('Пользователь не авторизован')
      }
      if (!apiUser) {
        throw new Error('Профиль пользователя не загружен')
      }
      if (selectedRestaurantId == null || selectedBuildingId == null) {
        throw new Error('Не выбран ресторан или офис для заказа')
      }
      if (selectedSlot == null) {
        throw new Error('Слот доставки не выбран')
      }

      const { total: totalPrice } = calculateOrderTotals(cart, 1)
      const itemsPayload = cart.map((entry) => ({
        id: entry.item.id,
        name: entry.item.name,
        price: entry.item.price,
        quantity: entry.qty,
      }))
      const created = await createOrderApi(apiUrl, {
        userId: apiUser.id,
        restaurantId: selectedRestaurantId,
        buildingId: selectedBuildingId,
        items: itemsPayload,
        totalPrice,
        deliverySlot: selectedSlot,
      })
      try {
        await payOrder(apiUrl, created.id, auth.user.id)
      } catch (payErr) {
        const msg =
          payErr instanceof Error ? payErr.message : 'Недостаточно средств'
        // Если оплата не прошла, помечаем заказ как отменён, чтобы он не попадал в общий заказ
        try {
          await cancelOrderApi(apiUrl, created.id, auth.user.id)
        } catch {
          // игнорируем ошибки отмены при неуспешной оплате
        }
        throw new Error(msg)
      }
      try {
        await deleteDraft(apiUrl, auth.user.id)
      } catch {
        // Ошибка удаления черновика не должна ломать успешный заказ
      }
      const order: Order = {
        id: String(created.id),
        userId: apiUser.id,
        restaurantId: selectedRestaurantId,
        buildingId: selectedBuildingId,
        items: [...cart],
        totalPrice,
        deliverySlot: selectedSlot,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
      }
      setCurrentOrder(order)
      setOrderHistory((prev) => [...prev, order])
      clearCart()
      return order
    },
    [
      auth,
      apiUser,
      selectedSlot,
      selectedRestaurantId,
      selectedBuildingId,
      cart,
      clearCart,
    ],
  )

  const cancelOrder = useCallback(
    async (apiUrl: string, orderId: string) => {
      if (!auth) throw new Error('Not authenticated')
      await cancelOrderApi(apiUrl, parseInt(orderId, 10), auth.user.id)
      setCurrentOrder(null)
      setOrderHistory((prev) => prev.filter((o) => o.id !== orderId))
    },
    [auth],
  )
  
  const value: AppState = {
    auth,
    setAuth,
    apiUser,
    setApiUser,
    buildings,
    restaurants,
    menuItems,
    deliverySlots,
    selectedBuildingId,
    selectedRestaurantId,
    selectedSlot,
    setSelectedBuildingId,
    setSelectedRestaurantId,
    setSelectedSlot,
    cart,
    addToCart,
    updateCartQty,
    clearCart,
    currentOrder,
    orderHistory,
    groupOrder,
    apiState,
    apiError,
    loadData,
    createOrder,
    cancelOrder,
    setBuildings,
    setRestaurants,
    setMenuItems,
    setDeliverySlots,
    setApiState,
    setApiError,
    setGroupOrder,
    setCurrentOrder,
  }
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
