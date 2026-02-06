'use client'

import { useState, useEffect, useMemo } from 'react'
import { AppBar, Badge } from '../components/ui'
import { SlotScreen } from '../components/screens/SlotScreen'
import { MenuScreen } from '../components/screens/MenuScreen'
import { OrderScreen } from '../components/screens/OrderScreen'
import { TrackingScreen } from '../components/screens/TrackingScreen'
import { HistoryScreen } from '../components/screens/HistoryScreen'
import { useApp } from '../store/AppContext'
import {
  initTelegramWebApp,
  readTelegramAuth,
  createLocalAuth,
} from '../lib/telegram'
import {
  fetchBuildings,
  fetchRestaurants,
  fetchMenu,
  fetchDeliverySlots,
} from '../lib/api'
import { mockBuildings, mockMenuItems, mockRestaurants } from '../lib/mockData'
import { getTestDataForBuilding, testBuildings, testMenuItems, testRestaurants } from '../lib/testData'
import { ORDER_CONFIG } from '../lib/config'
import type { TgUser } from '../lib/types'
import { testUserInputSchema, apiUrlSchema } from '../lib/validators'

const DEFAULT_API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002'

type Screen = 'slot' | 'menu' | 'order' | 'tracking' | 'history' | 'test'

export default function HomePage() {
  const [activeScreen, setActiveScreen] = useState<Screen>('slot')
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL)
  
  const [testInput, setTestInput] = useState({
    id: '123456',
    firstName: 'Ирина',
    lastName: 'Смирнова',
    username: 'test_user',
    photoUrl: '',
  })
  const [authError, setAuthError] = useState<string | null>(null)
  
  const {
    auth,
    setAuth,
    selectedBuildingId,
    selectedRestaurantId,
    buildings,
    restaurants,
    apiState,
    apiError,
    dataSource,
    setBuildings,
    setRestaurants,
    setMenuItems,
    setDeliverySlots,
    setApiState,
    setApiError,
    setDataSource,
    setSelectedBuildingId,
    setSelectedRestaurantId,
  } = useApp()
  
  useEffect(() => {
    initTelegramWebApp()
    const tgAuth = readTelegramAuth()
    if (tgAuth) {
      setAuth(tgAuth)
    }
  }, [setAuth])
  
  const handleTestAuth = () => {
    setAuthError(null)
    const parsed = testUserInputSchema.safeParse(testInput)
    if (!parsed.success) {
      setAuthError('Проверьте тестовые поля')
      return
    }
    const user = parsed.data as TgUser
    setAuth(createLocalAuth(user))
  }
  
  const applyFallbackData = () => {
    const fallbackBuildingId = testBuildings[0]?.id ?? mockBuildings[0]?.id ?? 1
    const fallbackRestaurants =
      testRestaurants.length > 0 ? testRestaurants : mockRestaurants
    const fallbackMenuItems =
      testMenuItems.length > 0 ? testMenuItems : mockMenuItems
    setBuildings(testBuildings.length > 0 ? testBuildings : mockBuildings)
    setRestaurants(fallbackRestaurants)
    setMenuItems(fallbackMenuItems)
    setSelectedBuildingId(fallbackBuildingId)
    setSelectedRestaurantId(fallbackRestaurants[0]?.id ?? 1)
  }
  
  const handleApiLoad = async () => {
    setApiError(null)
    const urlParsed = apiUrlSchema.safeParse(apiUrl)
    if (!urlParsed.success) {
      setApiError('Нужен корректный URL API')
      setApiState('error')
      return
    }
    
    setApiState('loading')
    try {
      const apiBuildings = await fetchBuildings(apiUrl)
      const buildingId = apiBuildings[0]?.id ?? 0
      if (!buildingId) {
        throw new Error('no_buildings')
      }
      
      const apiRestaurants = await fetchRestaurants(apiUrl, buildingId)
      const restaurantId = apiRestaurants[0]?.id ?? 0
      if (!restaurantId) {
        throw new Error('no_restaurants')
      }
      
      const apiSlots = await fetchDeliverySlots(apiUrl)
      const apiMenu = await fetchMenu(apiUrl, restaurantId)
      
      if (apiMenu.length === 0) {
        const fallback = getTestDataForBuilding(buildingId)
        if (fallback.menuItems.length === 0) {
          applyFallbackData()
          throw new Error('empty_menu')
        }
        setBuildings(apiBuildings)
        setRestaurants(fallback.restaurants)
        setMenuItems(fallback.menuItems)
        setSelectedBuildingId(buildingId)
        setSelectedRestaurantId(fallback.restaurants[0]?.id ?? restaurantId)
        setDeliverySlots(apiSlots.length > 0 ? apiSlots : ORDER_CONFIG.fallbackSlots)
        setDataSource('api')
        setApiState('success')
        return
      }
      
      setBuildings(apiBuildings)
      setRestaurants(apiRestaurants)
      setMenuItems(apiMenu)
      setDeliverySlots(apiSlots.length > 0 ? apiSlots : ORDER_CONFIG.fallbackSlots)
      setSelectedBuildingId(buildingId)
      setSelectedRestaurantId(restaurantId)
      setDataSource('api')
      setApiState('success')
    } catch (_error) {
      setApiError('Не удалось загрузить данные, использую тестовые данные')
      setDataSource('mock')
      applyFallbackData()
      setDeliverySlots(ORDER_CONFIG.fallbackSlots)
      setApiState('error')
    }
  }
  
  const handleMockReset = () => {
    setDataSource('mock')
    applyFallbackData()
    setApiState('idle')
    setApiError(null)
  }
  
  useEffect(() => {
    handleApiLoad().catch(() => undefined)
  }, [])
  
  const selectedBuilding = useMemo(
    () => buildings.find((building) => building.id === selectedBuildingId),
    [buildings, selectedBuildingId],
  )
  
  const selectedRestaurant = useMemo(
    () => restaurants.find((restaurant) => restaurant.id === selectedRestaurantId),
    [restaurants, selectedRestaurantId],
  )
  
  const authLabel = auth
    ? auth.source === 'telegram'
      ? 'Telegram'
      : 'Локальный тест'
    : 'Нет данных'
  
  return (
    <>
      <AppBar
        title="Обед в Офис"
        right={<Badge>{dataSource === 'api' ? 'API' : 'Test'}</Badge>}
      />
      
      <div className="tabs">
        {[
          { id: 'slot', label: 'Слот' },
          { id: 'menu', label: 'Меню' },
          { id: 'order', label: 'Заказ' },
          { id: 'tracking', label: 'Статус' },
          { id: 'history', label: 'История' },
        ].map((tab) => (
          <button
            key={tab.id}
            className={`tab ${activeScreen === tab.id ? 'tab-active' : ''}`}
            type="button"
            onClick={() => setActiveScreen(tab.id as Screen)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      <div className="info-bar">
        <div className="info-row">
          <span>Офис</span>
          <strong>{selectedBuilding?.name ?? '—'}</strong>
        </div>
        <div className="info-row">
          <span>Ресторан</span>
          <strong>{selectedRestaurant?.name ?? '—'}</strong>
        </div>
      </div>
      
      {activeScreen === 'slot' && (
        <SlotScreen onNext={() => setActiveScreen('menu')} />
      )}
      
      {activeScreen === 'menu' && (
        <MenuScreen
          onGoToSlot={() => setActiveScreen('slot')}
          onNext={() => setActiveScreen('order')}
        />
      )}
      
      {activeScreen === 'order' && (
        <OrderScreen
          onEdit={() => setActiveScreen('menu')}
          onOrderCreated={() => setActiveScreen('tracking')}
        />
      )}
      
      {activeScreen === 'tracking' && <TrackingScreen />}
      
      {activeScreen === 'history' && <HistoryScreen />}
      
      {activeScreen === 'test' && (
        <>
          <div className="card card-soft">
            <div className="section-title">Авторизация</div>
            <div className="section-subtitle">
              Используем initData из Telegram или тестовые параметры
            </div>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span className="info-pill">Статус: {authLabel}</span>
              <span className={auth ? 'status-good' : 'status-warn'}>
                {auth ? 'Готово' : 'Нужно авторизоваться'}
              </span>
            </div>
            {auth ? (
              <div className="card" style={{ marginTop: 12 }}>
                <div style={{ fontWeight: 600 }}>{auth.user.firstName}</div>
                <div className="muted">
                  {auth.user.username ? `@${auth.user.username}` : 'Без username'}
                </div>
                <div className="muted" style={{ marginTop: 6 }}>
                  ID: {auth.user.id}
                </div>
              </div>
            ) : null}
            <div className="divider" />
            <div className="section-title" style={{ fontSize: 16 }}>
              Локальный тест
            </div>
            <div className="row">
              <input
                className="input"
                value={testInput.id}
                onChange={(event) =>
                  setTestInput((prev) => ({ ...prev, id: event.target.value }))
                }
                placeholder="Telegram ID"
              />
              <input
                className="input"
                value={testInput.firstName}
                onChange={(event) =>
                  setTestInput((prev) => ({
                    ...prev,
                    firstName: event.target.value,
                  }))
                }
                placeholder="Имя"
              />
            </div>
            <div className="row" style={{ marginTop: 8 }}>
              <input
                className="input"
                value={testInput.lastName}
                onChange={(event) =>
                  setTestInput((prev) => ({
                    ...prev,
                    lastName: event.target.value,
                  }))
                }
                placeholder="Фамилия"
              />
              <input
                className="input"
                value={testInput.username}
                onChange={(event) =>
                  setTestInput((prev) => ({
                    ...prev,
                    username: event.target.value,
                  }))
                }
                placeholder="Username"
              />
            </div>
            <div className="row" style={{ marginTop: 8 }}>
              <input
                className="input"
                value={testInput.photoUrl}
                onChange={(event) =>
                  setTestInput((prev) => ({
                    ...prev,
                    photoUrl: event.target.value,
                  }))
                }
                placeholder="URL фото (опционально)"
              />
            </div>
            {authError ? (
              <div className="muted" style={{ color: 'var(--orange)' }}>
                {authError}
              </div>
            ) : null}
            <div className="row" style={{ marginTop: 10, gap: 12 }}>
              <button type="button" className="btn" onClick={handleTestAuth}>
                Применить тестовые данные
              </button>
            </div>
          </div>
          
          <div className="section">
            <div className="section-title">Источник данных</div>
            <div className="section-subtitle">
              Можно подключить локальный backend или остаться на тестовых
            </div>
            <div className="card">
              <div className="row" style={{ flexWrap: 'wrap' }}>
                <input
                  className="input"
                  value={apiUrl}
                  onChange={(event) => setApiUrl(event.target.value)}
                  placeholder="http://localhost:3000"
                />
                <button type="button" className="btn-secondary" onClick={handleApiLoad}>
                  Загрузить API
                </button>
                <button type="button" className="btn-secondary" onClick={handleMockReset}>
                  Тест‑данные
                </button>
              </div>
              <div className="row" style={{ marginTop: 8 }}>
                <span className="muted">Состояние API:</span>
                <span className="muted">
                  {apiState === 'loading'
                    ? 'загрузка'
                    : apiState === 'success'
                      ? 'готово'
                      : apiState === 'error'
                        ? 'ошибка'
                        : 'ожидание'}
                </span>
              </div>
              {apiError ? (
                <div className="muted" style={{ color: 'var(--orange)' }}>
                  {apiError}
                </div>
              ) : null}
            </div>
          </div>
        </>
      )}
    </>
  )
}
