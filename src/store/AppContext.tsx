'use client'

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import type { 
  TgAuth, 
  Building, 
  Restaurant, 
  MenuItem, 
  CartItem, 
  DeliverySlot 
} from '../lib/types'
import { ORDER_CONFIG } from '../lib/config'

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'

type Order = {
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
  dataSource: 'mock' | 'api'
  
  // Actions
  loadData: (apiUrl: string) => Promise<void>
  createOrder: () => Promise<Order>
  cancelOrder: (orderId: string) => Promise<void>
  
  // Setters
  setBuildings: (buildings: Building[]) => void
  setRestaurants: (restaurants: Restaurant[]) => void
  setMenuItems: (menuItems: MenuItem[]) => void
  setDeliverySlots: (slots: DeliverySlot[]) => void
  setApiState: (state: ApiState) => void
  setApiError: (error: string | null) => void
  setDataSource: (source: 'mock' | 'api') => void
  setGroupOrder: (groupOrder: GroupOrder | null) => void
}

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<TgAuth | null>(null)
  const [buildings, setBuildings] = useState<Building[]>([])
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [deliverySlots, setDeliverySlots] = useState<DeliverySlot[]>(ORDER_CONFIG.fallbackSlots)
  
  const [selectedBuildingId, setSelectedBuildingId] = useState<number | null>(null)
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  
  const [cart, setCart] = useState<CartItem[]>([])
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
  const [orderHistory, setOrderHistory] = useState<Order[]>([])
  const [groupOrder, setGroupOrder] = useState<GroupOrder | null>(null)
  
  const [apiState, setApiState] = useState<ApiState>('idle')
  const [apiError, setApiError] = useState<string | null>(null)
  const [dataSource, setDataSource] = useState<'mock' | 'api'>('mock')
  
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
  
  const loadData = useCallback(async (apiUrl: string) => {
    setApiState('loading')
    setApiError(null)
    // Implementation will be added in next phase
    setApiState('idle')
  }, [])
  
  const createOrder = useCallback(async () => {
    if (!auth || !selectedSlot || !selectedRestaurantId || !selectedBuildingId || cart.length === 0) {
      throw new Error('Missing required order data')
    }
    
    const totalPrice = cart.reduce((sum, entry) => sum + entry.item.price * entry.qty, 0)
    
    const order: Order = {
      id: `order-${Date.now()}`,
      userId: auth.user.id,
      restaurantId: selectedRestaurantId,
      buildingId: selectedBuildingId,
      items: [...cart],
      totalPrice,
      deliverySlot: selectedSlot,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }
    
    setCurrentOrder(order)
    setOrderHistory((prev) => [...prev, order])
    clearCart()
    
    return order
  }, [auth, selectedSlot, selectedRestaurantId, selectedBuildingId, cart, clearCart])
  
  const cancelOrder = useCallback(async (orderId: string) => {
    // Implementation will be added in next phase
    setCurrentOrder(null)
  }, [])
  
  const value: AppState = {
    auth,
    setAuth,
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
    dataSource,
    loadData,
    createOrder,
    cancelOrder,
    setBuildings,
    setRestaurants,
    setMenuItems,
    setDeliverySlots,
    setApiState,
    setApiError,
    setDataSource,
    setGroupOrder,
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
