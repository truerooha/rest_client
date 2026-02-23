'use client'

import { useState, useMemo } from 'react'
import type { MenuItem, CartItem } from '../../lib/types'
import { Card, Badge, Chip, SearchBar, Stepper } from '../ui'

/**
 * Приоритет категорий: 1 — основные блюда, 2 — второстепенное, 3 — напитки/десерты/прочее
 */
const CATEGORY_PRIORITY: Record<string, number> = {
  'Горячие блюда': 1, 'Блюда на гриле': 1, 'Рыбные блюда': 1,
  'Супы': 1, 'Пицца': 1, 'Паста': 1, 'Ризотто': 1, 'Завтраки': 1,
  'Салаты': 2, 'Роллы': 2, 'Сэндвичи': 2, 'Закуски': 2, 'Гарниры': 2,
  'Напитки': 3, 'Десерты': 3,
}

function getCategoryPriority(category: string): number {
  return CATEGORY_PRIORITY[category] ?? 3
}

type MenuGridProps = {
  menuItems: MenuItem[]
  cart: CartItem[]
  onAddToCart: (item: MenuItem) => void
  onUpdateQty: (itemId: number, delta: number) => void
  formatPrice: (price: number) => string
  disabledAddToCart?: boolean
}

export function MenuGrid({
  menuItems,
  cart,
  onAddToCart,
  onUpdateQty,
  formatPrice,
  disabledAddToCart = false,
}: MenuGridProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const getCartQty = (itemId: number) =>
    cart.find((e) => e.item.id === itemId)?.qty ?? 0
  
  const categories = useMemo(() => {
    const cats = new Set(menuItems.map((item) => item.category || 'Другое'))
    return Array.from(cats).sort((a, b) => getCategoryPriority(a) - getCategoryPriority(b))
  }, [menuItems])
  
  const filteredItems = useMemo(() => {
    let items = menuItems
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query),
      )
    }
    
    if (selectedCategory) {
      items = items.filter((item) => (item.category || 'Другое') === selectedCategory)
    }
    
    return items
  }, [menuItems, searchQuery, selectedCategory])
  
  const groupedItems = useMemo(() => {
    return filteredItems.reduce<Record<string, MenuItem[]>>((acc, item) => {
      const category = item.category || 'Другое'
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category] = [...acc[category], item]
      return acc
    }, {})
  }, [filteredItems])
  
  return (
    <div className="menu-grid-container">
      <div className="menu-controls">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onClear={() => setSearchQuery('')}
          placeholder="Найти блюдо..."
        />
        
        <div className="category-chips">
          <Chip
            active={selectedCategory === null}
            onClick={() => setSelectedCategory(null)}
          >
            Все
          </Chip>
          {categories.map((category) => (
            <Chip
              key={category}
              active={selectedCategory === category}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Chip>
          ))}
        </div>
      </div>
      
      {Object.entries(groupedItems).length === 0 ? (
        <Card>
          <div className="empty-card">
            <div className="empty-card-icon">🔍</div>
            <div className="text-strong">Ничего не найдено</div>
            <div className="muted mt-4">
              Попробуйте изменить поисковый запрос
            </div>
          </div>
        </Card>
      ) : (
        Object.entries(groupedItems)
          .sort(([a], [b]) => getCategoryPriority(a) - getCategoryPriority(b))
          .map(([category, items]) => (
          <Card key={category}>
            <div className="row-between">
              <div className="text-strong">{category}</div>
              <Badge>{items.length}</Badge>
            </div>
            <div className="divider" />
            <div className="grid-2">
              {items.map((item) => (
                <div key={item.id} className="product-card">
                  <div className="product-image-wrap">
                    {(item.thumbnailUrl || item.imageUrl) ? (
                      <img
                        src={item.thumbnailUrl ?? item.imageUrl}
                        alt={item.name}
                        className="product-image-img"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.currentTarget
                          target.style.display = 'none'
                          const fallback = target.nextElementSibling
                          if (fallback) (fallback as HTMLElement).style.display = ''
                        }}
                      />
                    ) : null}
                    <span
                      className="product-image"
                      aria-hidden
                      style={(item.thumbnailUrl || item.imageUrl) ? { display: 'none' } : undefined}
                    >
                      {item.emoji}
                    </span>
                    <div
                      className={`product-card-action ${getCartQty(item.id) > 0 ? 'product-card-action--expanded' : ''}`}
                    >
                      {getCartQty(item.id) > 0 ? (
                        <Stepper
                          value={getCartQty(item.id)}
                          onDecrease={disabledAddToCart ? () => {} : () => onUpdateQty(item.id, -1)}
                          onIncrease={disabledAddToCart ? () => {} : () => onUpdateQty(item.id, 1)}
                        />
                      ) : (
                        <button
                          type="button"
                          className="product-card-add-btn"
                          onClick={() => !disabledAddToCart && onAddToCart(item)}
                          disabled={disabledAddToCart}
                          aria-label="Добавить в заказ"
                        >
                          +
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="product-card-name">{item.name}</div>
                  {item.description ? (
                    <div className="muted product-card-desc">{item.description}</div>
                  ) : null}
                  <div className="row-between">
                    <span className="price">{formatPrice(item.price)}</span>
                    <Badge>{item.unit}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))
      )}
    </div>
  )
}
