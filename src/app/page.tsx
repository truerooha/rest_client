'use client'

import { useMemo, useState, useEffect } from 'react'
import {
  AppBar,
  Badge,
  Card,
  PrimaryButton,
  SecondaryButton,
  Section,
  Stepper,
} from '../components/ui'
import { mockBuildings, mockMenuItems, mockRestaurants } from '../lib/mockData'
import {
  createLocalAuth,
  initTelegramWebApp,
  readTelegramAuth,
} from '../lib/telegram'
import { apiUrlSchema, testUserInputSchema } from '../lib/validators'
import { CartItem, DeliverySlot, MenuItem, Restaurant, TgAuth, TgUser } from '../lib/types'
import {
  fetchBuildings,
  fetchDeliverySlots,
  fetchMenu,
  fetchRestaurants,
} from '../lib/api'
import { ORDER_CONFIG } from '../lib/config'
import {
  getTestDataForBuilding,
  testBuildings,
  testMenuItems,
  testRestaurants,
} from '../lib/testData'

const DEFAULT_API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002'

type ApiState = 'idle' | 'loading' | 'ok' | 'error'
type Screen = 'slot' | 'menu' | 'order' | 'test'

export default function HomePage() {
  const [activeScreen, setActiveScreen] = useState<Screen>('slot')
  const [auth, setAuth] = useState<TgAuth | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)
  const [testInput, setTestInput] = useState({
    id: '123456',
    firstName: 'Ирина',
    lastName: 'Смирнова',
    username: 'test_user',
    photoUrl: '',
  })

  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL)
  const [apiState, setApiState] = useState<ApiState>('idle')
  const [apiError, setApiError] = useState<string | null>(null)
  const [dataSource, setDataSource] = useState<'mock' | 'api'>('mock')

  const [buildings, setBuildings] = useState(mockBuildings)
  const [restaurants, setRestaurants] = useState(mockRestaurants)
  const [menuItems, setMenuItems] = useState(mockMenuItems)

  const [selectedBuildingId, setSelectedBuildingId] = useState<number>(
    mockBuildings[0]?.id ?? 1,
  )
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<number>(
    mockRestaurants[0]?.id ?? 1,
  )

  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [deliverySlots, setDeliverySlots] = useState<DeliverySlot[]>(
    ORDER_CONFIG.fallbackSlots,
  )

  useEffect(() => {
    initTelegramWebApp()
    const tgAuth = readTelegramAuth()
    if (tgAuth) {
      setAuth(tgAuth)
    }
  }, [])

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
        setApiState('ok')
        return
      }

      setBuildings(apiBuildings)
      setRestaurants(apiRestaurants)
      setMenuItems(apiMenu)
      setDeliverySlots(apiSlots.length > 0 ? apiSlots : ORDER_CONFIG.fallbackSlots)
      setSelectedBuildingId(buildingId)
      setSelectedRestaurantId(restaurantId)
      setDataSource('api')
      setApiState('ok')
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

  const selectedRestaurant = useMemo<Restaurant | undefined>(() => {
    return restaurants.find(
      (restaurant) => restaurant.id === selectedRestaurantId,
    )
  }, [restaurants, selectedRestaurantId])

  const activeMenuItems = useMemo<MenuItem[]>(
    () => menuItems.filter((item) => item.restaurantId === selectedRestaurantId),
    [menuItems, selectedRestaurantId],
  )

  const menuByCategory = useMemo(() => {
    return activeMenuItems.reduce<Record<string, MenuItem[]>>((acc, item) => {
      const category = item.category || 'Другое'
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category] = [...acc[category], item]
      return acc
    }, {})
  }, [activeMenuItems])

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, entry) => sum + entry.item.price * entry.qty, 0)
  }, [cart])

  const discountAmount = useMemo(() => {
    return Math.round((cartTotal * ORDER_CONFIG.discountPercent) / 100)
  }, [cartTotal])

  const totalWithDiscount = useMemo(() => {
    return Math.max(cartTotal - discountAmount, 0)
  }, [cartTotal, discountAmount])

  const addToCart = (item: MenuItem) => {
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
  }

  const updateQty = (itemId: number, delta: number) => {
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
  }

  const handleCancelOrder = () => {
    if (!isCancelAvailable) return
    setCart([])
  }

  const handleSelectSlot = (slotId: string, enabled: boolean) => {
    if (!enabled) return
    setSelectedSlot(slotId)
  }

  const formatPrice = (price: number) => `${price} ₽`
  const authLabel = auth
    ? auth.source === 'telegram'
      ? 'Telegram'
      : 'Локальный тест'
    : 'Нет данных'

  const isCancelAvailable = (() => {
    const [hours, minutes] = ORDER_CONFIG.cancelDeadline.split(':').map(Number)
    const now = new Date()
    const deadline = new Date()
    deadline.setHours(hours, minutes, 0, 0)
    return now.getTime() <= deadline.getTime()
  })()

  const orderSlotLabel = selectedSlot
    ? `Доставка в ${selectedSlot}`
    : 'Слот не выбран'

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
          { id: 'test', label: 'Тест' },
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
        <div className="info-row">
          <span>Слот</span>
          <strong>{selectedSlot ?? 'не выбран'}</strong>
        </div>
      </div>

      {activeScreen === 'slot' ? (
        <Section
          title="Выбор слота доставки"
          subtitle="Сейчас доступен только 13:00"
        >
          {deliverySlots.map((slot) => (
            <Card
              key={slot.id}
              className={`slot-card ${slot.isAvailable ? '' : 'slot-disabled'}`}
            >
              <div className="slot-time">{slot.time}</div>
              <div className="slot-note">
                {slot.isAvailable ? `До ${slot.deadline}` : 'Недоступно'}
              </div>
              <SecondaryButton
                type="button"
                onClick={() => handleSelectSlot(slot.id, slot.isAvailable)}
                disabled={!slot.isAvailable}
              >
                {selectedSlot === slot.id ? 'Выбрано' : 'Выбрать'}
              </SecondaryButton>
            </Card>
          ))}
          <PrimaryButton
            type="button"
            onClick={() => setActiveScreen('menu')}
            disabled={!selectedSlot}
          >
            Перейти к меню
          </PrimaryButton>
        </Section>
      ) : null}

      {activeScreen === 'menu' ? (
        <Section title="Меню ресторана" subtitle={orderSlotLabel}>
          {!selectedSlot ? (
            <Card>
              <div style={{ fontWeight: 600 }}>Сначала выберите слот</div>
              <div className="muted">
                После выбора слота откроется меню
              </div>
              <PrimaryButton
                type="button"
                style={{ marginTop: 10 }}
                onClick={() => setActiveScreen('slot')}
              >
                Перейти к выбору слота
              </PrimaryButton>
            </Card>
          ) : (
            <>
              {Object.entries(menuByCategory).map(([category, items]) => (
                <Card key={category}>
                  <div className="row" style={{ justifyContent: 'space-between' }}>
                    <div style={{ fontWeight: 600 }}>{category}</div>
                    <Badge>{items.length}</Badge>
                  </div>
                  <div className="divider" />
                  <div className="grid-2">
                    {items.map((item) => (
                      <div key={item.id} className="product-card">
                        <div className="product-image">{item.emoji}</div>
                        <div style={{ fontWeight: 600 }}>{item.name}</div>
                        <div className="muted">{item.description}</div>
                        <div
                          className="row"
                          style={{ justifyContent: 'space-between' }}
                        >
                          <span className="price">{formatPrice(item.price)}</span>
                          <Badge>{item.unit}</Badge>
                        </div>
                        <SecondaryButton
                          type="button"
                          onClick={() => addToCart(item)}
                        >
                          В заказ
                        </SecondaryButton>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </>
          )}
        </Section>
      ) : null}

      {activeScreen === 'order' ? (
        <Section title="Ваш заказ" subtitle={orderSlotLabel}>
          <div className="order-grid">
            <Card>
              {cart.length === 0 ? (
                <>
                  <div style={{ fontWeight: 600 }}>Пока пусто</div>
                  <div className="muted">Добавьте блюда из меню</div>
                </>
              ) : (
                <>
                  <div className="order-summary">
                    {cart.map((entry) => (
                      <div key={entry.item.id} className="cart-item">
                        <div className="product-image">{entry.item.emoji}</div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{entry.item.name}</div>
                          <div className="muted">{entry.item.unit}</div>
                          <div className="price">
                            {formatPrice(entry.item.price)}
                          </div>
                        </div>
                        <Stepper
                          value={entry.qty}
                          onDecrease={() => updateQty(entry.item.id, -1)}
                          onIncrease={() => updateQty(entry.item.id, 1)}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="divider" />
                  <div className="order-summary">
                    <div className="row" style={{ justifyContent: 'space-between' }}>
                      <span className="order-muted">Сумма</span>
                      <strong>{formatPrice(cartTotal)}</strong>
                    </div>
                    <div className="row" style={{ justifyContent: 'space-between' }}>
                      <span className="order-muted">
                        Скидка {ORDER_CONFIG.discountPercent}%
                      </span>
                      <strong>-{formatPrice(discountAmount)}</strong>
                    </div>
                    <div className="row" style={{ justifyContent: 'space-between' }}>
                      <span className="order-muted">К оплате</span>
                      <strong>{formatPrice(totalWithDiscount)}</strong>
                    </div>
                  </div>
                  <div className="divider" />
                  <div className="order-muted">
                    Отмена доступна до {ORDER_CONFIG.cancelDeadline}
                  </div>
                  <div className="order-actions">
                    <SecondaryButton
                      type="button"
                      disabled={!isCancelAvailable}
                      onClick={() => setActiveScreen('menu')}
                    >
                      Редактировать
                    </SecondaryButton>
                    <SecondaryButton
                      type="button"
                      disabled={!isCancelAvailable}
                      onClick={handleCancelOrder}
                    >
                      Отменить
                    </SecondaryButton>
                  </div>
                </>
              )}
            </Card>

            <Card className="card-soft">
              <div style={{ fontWeight: 600 }}>Общий заказ офиса</div>
              <div className="order-muted" style={{ marginTop: 4 }}>
                Собираем заказы до {ORDER_CONFIG.cancelDeadline}
              </div>
              <div className="divider" />
              <div className="order-summary">
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <span className="order-muted">Участники</span>
                  <strong>7</strong>
                </div>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <span className="order-muted">Общая сумма</span>
                  <strong>4 820 ₽</strong>
                </div>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <span className="order-muted">До минималки</span>
                  <strong>180 ₽</strong>
                </div>
              </div>
              <div className="order-muted" style={{ marginTop: 8 }}>
                Это общий сбор: дальше добавим статусы и чат‑уведомления.
              </div>
            </Card>
          </div>
        </Section>
      ) : null}

      {activeScreen === 'test' ? (
        <>
          <Card className="card-soft">
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
              <PrimaryButton type="button" onClick={handleTestAuth}>
                Применить тестовые данные
              </PrimaryButton>
            </div>
          </Card>

          <Section
            title="Источник данных"
            subtitle="Можно подключить локальный backend или остаться на тестовых"
          >
            <Card>
              <div className="row" style={{ flexWrap: 'wrap' }}>
                <input
                  className="input"
                  value={apiUrl}
                  onChange={(event) => setApiUrl(event.target.value)}
                  placeholder="http://localhost:3000"
                />
                <SecondaryButton type="button" onClick={handleApiLoad}>
                  Загрузить API
                </SecondaryButton>
                <SecondaryButton type="button" onClick={handleMockReset}>
                  Тест‑данные
                </SecondaryButton>
              </div>
              <div className="row" style={{ marginTop: 8 }}>
                <span className="muted">Состояние API:</span>
                <span className="muted">
                  {apiState === 'loading'
                    ? 'загрузка'
                    : apiState === 'ok'
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
            </Card>
          </Section>
        </>
      ) : null}
    </>
  )
}
