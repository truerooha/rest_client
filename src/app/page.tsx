'use client'

import { useState, useEffect, useMemo } from 'react'
import { AppBar, ContextCard, StepTabs, SecondaryButton, LoadingScreen } from '../components/ui'
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
import type { TgUser } from '../lib/types'
import { testUserInputSchema, apiUrlSchema } from '../lib/validators'

const IS_PRODUCTION = process.env.NODE_ENV === 'production'
const DEFAULT_API_URL = IS_PRODUCTION
  ? process.env.NEXT_PUBLIC_API_URL ?? ''
  : 'http://localhost:3002'

type Screen = 'slot' | 'menu' | 'order' | 'tracking' | 'history' | 'test'

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 2000)
    return () => clearTimeout(t)
  }, [])
  const [activeScreen, setActiveScreen] = useState<Screen>('slot')
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL)
  const [hasRetriedLoad, setHasRetriedLoad] = useState(false)
  
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
    selectedSlot,
    buildings,
    restaurants,
    menuItems,
    cart,
    currentOrder,
    orderHistory,
    apiState,
    apiError,
    setBuildings,
    setRestaurants,
    setMenuItems,
    setDeliverySlots,
    setApiState,
    setApiError,
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
      const firstRestaurantId = apiRestaurants[0]?.id ?? 0
      if (!firstRestaurantId) {
        throw new Error('no_restaurants')
      }
      
      const apiSlots = await fetchDeliverySlots(apiUrl)
      
      // Пытаемся найти ресторан с непустым меню
      let chosenRestaurant = apiRestaurants[0]
      let apiMenu = await fetchMenu(apiUrl, chosenRestaurant.id)

      if (apiMenu.length === 0 && apiRestaurants.length > 1) {
        for (const restaurant of apiRestaurants.slice(1)) {
          const menu = await fetchMenu(apiUrl, restaurant.id)
          if (menu.length > 0) {
            chosenRestaurant = restaurant
            apiMenu = menu
            break
          }
        }
      }

      if (apiMenu.length === 0) {
        setBuildings(apiBuildings)
        setRestaurants(apiRestaurants)
        setMenuItems([])
        setSelectedBuildingId(buildingId)
        setSelectedRestaurantId(chosenRestaurant.id)
        setDeliverySlots(apiSlots)
        setApiState('error')
        setApiError('Меню пока пусто. Обратитесь к администратору.')
        return
      }
      
      setBuildings(apiBuildings)
      setRestaurants(apiRestaurants)
      setMenuItems(apiMenu)
      setDeliverySlots(apiSlots)
      setSelectedBuildingId(buildingId)
      setSelectedRestaurantId(chosenRestaurant.id)
      setApiState('success')
    } catch (_error) {
      setApiError('Не удалось загрузить данные с сервера')
      setDeliverySlots([])
      setApiState('error')
    }
  }
  
  useEffect(() => {
    handleApiLoad().catch(() => undefined)
  }, [])

  useEffect(() => {
    if (
      activeScreen === 'menu' &&
      menuItems.length === 0 &&
      apiState !== 'loading' &&
      !hasRetriedLoad
    ) {
      setHasRetriedLoad(true)
      handleApiLoad().catch(() => undefined)
    }
  }, [activeScreen, apiState, hasRetriedLoad, menuItems.length])

  useEffect(() => {
    if (apiState === 'success' && menuItems.length > 0 && hasRetriedLoad) {
      setHasRetriedLoad(false)
    }
  }, [apiState, hasRetriedLoad, menuItems.length])
  
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

  const stepTabs = [
    { id: 'slot', label: 'Слот', disabled: false },
    { id: 'menu', label: 'Меню', disabled: !selectedSlot },
    { id: 'order', label: 'Заказ', disabled: !selectedSlot || cart.length === 0 },
    { id: 'tracking', label: 'Статус', disabled: !currentOrder },
    { id: 'history', label: 'История', disabled: false },
  ] as const

  const stepOrder = stepTabs.map((tab) => tab.id)
  
  const activeStepId = (stepOrder.includes(activeScreen as any)
    ? activeScreen
    : 'slot') as typeof stepTabs[number]['id']

  const stepTabsWithVisited = stepTabs.map((tab) => {
    const activeIndex = stepOrder.indexOf(activeStepId)
    const tabIndex = stepOrder.indexOf(tab.id)
    return {
      ...tab,
      visited: tabIndex < activeIndex,
    }
  })
  
  return (
    <>
      {showSplash ? <LoadingScreen /> : null}
      <AppBar
        title="Обед в Офис"
      />
      
      {auth ? (
        <div className="tg-user-label" aria-hidden>
          {auth.user.username ? `@${auth.user.username}` : `${auth.user.firstName}${auth.user.lastName ? ' ' + auth.user.lastName : ''}`}
        </div>
      ) : null}
      
      <StepTabs
        items={stepTabsWithVisited}
        activeId={activeStepId}
        onSelect={(id) => setActiveScreen(id as Screen)}
      />
      
      <ContextCard
        rows={[
          { label: 'Офис', value: selectedBuilding?.name ?? '—' },
          { label: 'Ресторан', value: selectedRestaurant?.name ?? '—' },
          ...(selectedSlot ? [{ label: 'Слот', value: selectedSlot }] : []),
        ]}
      />

      {!IS_PRODUCTION ? (
        <SecondaryButton type="button" onClick={() => setActiveScreen('test')}>
          Тестовый экран
        </SecondaryButton>
      ) : null}

      
      
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
      
      {activeScreen === 'test' && !IS_PRODUCTION && (
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
              Подключите локальный backend и загрузите данные с API
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
