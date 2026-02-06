'use client'

import { useState, useMemo } from 'react'
import type { MenuItem } from '../../lib/types'
import { Card, Badge, SecondaryButton, Chip, SearchBar } from '../ui'

type MenuGridProps = {
  menuItems: MenuItem[]
  onAddToCart: (item: MenuItem) => void
  formatPrice: (price: number) => string
}

export function MenuGrid({ menuItems, onAddToCart, formatPrice }: MenuGridProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  
  const categories = useMemo(() => {
    const cats = new Set(menuItems.map((item) => item.category || 'Другое'))
    return Array.from(cats)
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
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
            <div style={{ fontWeight: 600 }}>Ничего не найдено</div>
            <div className="muted" style={{ marginTop: 4 }}>
              Попробуйте изменить поисковый запрос
            </div>
          </div>
        </Card>
      ) : (
        Object.entries(groupedItems).map(([category, items]) => (
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
                  {item.description ? (
                    <div className="muted">{item.description}</div>
                  ) : null}
                  <div className="row" style={{ justifyContent: 'space-between' }}>
                    <span className="price">{formatPrice(item.price)}</span>
                    <Badge>{item.unit}</Badge>
                  </div>
                  <SecondaryButton type="button" onClick={() => onAddToCart(item)}>
                    В заказ
                  </SecondaryButton>
                </div>
              ))}
            </div>
          </Card>
        ))
      )}
    </div>
  )
}
