'use client'

import { Section, Card, PrimaryButton, SecondaryButton } from '../ui'
import { useApp } from '../../store/AppContext'

type RestaurantsScreenProps = {
  onOpenMenu: () => void
  onBack: () => void
}

export function RestaurantsScreen({ onOpenMenu, onBack }: RestaurantsScreenProps) {
  const { restaurants, selectedRestaurantId, setSelectedRestaurantId } = useApp()

  return (
    <Section title="Выбор ресторана" subtitle="Выберите ресторан для заказа">
      <div style={{ display: 'grid', gap: 12 }}>
        {restaurants.map((restaurant) => (
          <Card
            key={restaurant.id}
            className={selectedRestaurantId === restaurant.id ? 'card-soft' : undefined}
          >
            <div
              className="row"
              style={{
                alignItems: 'center',
                gap: 12,
                cursor: 'pointer',
              }}
              onClick={() => setSelectedRestaurantId(restaurant.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setSelectedRestaurantId(restaurant.id)
                }
              }}
              role="button"
              tabIndex={0}
            >
              <span style={{ fontSize: 32 }}>{restaurant.coverEmoji}</span>
              <div>
                <div style={{ fontWeight: 600 }}>{restaurant.name}</div>
                <div className="muted" style={{ fontSize: 14 }}>
                  {restaurant.cuisine} · {restaurant.priceLevel}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <div style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <SecondaryButton type="button" onClick={onBack}>
          Назад
        </SecondaryButton>
        <PrimaryButton
          type="button"
          onClick={onOpenMenu}
          disabled={!selectedRestaurantId}
        >
          Открыть меню
        </PrimaryButton>
      </div>
    </Section>
  )
}
