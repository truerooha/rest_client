'use client'

import { Fragment } from 'react'
import type { OrderStatus } from '../../lib/types'

type StatusStep = {
  id: OrderStatus
  label: string
}

const STATUS_STEPS: StatusStep[] = [
  { id: 'pending', label: 'Ожидает' },
  { id: 'restaurant_confirmed', label: 'Подтверждён' },
  { id: 'preparing', label: 'Готовится' },
  { id: 'ready', label: 'Готов' },
  { id: 'delivered', label: 'Доставлен' },
]

type OrderStatusTimelineProps = {
  currentStatus: OrderStatus
}

export function OrderStatusTimeline({ currentStatus }: OrderStatusTimelineProps) {
  const displayStatus = currentStatus === 'confirmed' ? 'restaurant_confirmed' : currentStatus
  const currentIndex = STATUS_STEPS.findIndex((step) => step.id === displayStatus)
  const isCancelled = currentStatus === 'cancelled'

  if (isCancelled) {
    return (
      <div className="status-timeline">
        <div className="status-cancelled">
          <div className="status-dot" style={{ backgroundColor: 'var(--danger)' }} />
          <div className="status-label" style={{ color: 'var(--danger)' }}>
            Заказ отменён
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="status-timeline">
      <div className="status-dots-row">
        {STATUS_STEPS.map((step, index) => {
          const isCompleted = index <= currentIndex
          const isActive = index === currentIndex

          return (
            <Fragment key={step.id}>
              <div
                className={`status-dot ${isActive ? 'status-dot-active' : ''}`}
                style={{
                  backgroundColor: isCompleted ? 'var(--primary)' : 'var(--gray-light)',
                }}
              />
              {index < STATUS_STEPS.length - 1 ? (
                <div
                  className="status-line"
                  style={{
                    backgroundColor: isCompleted
                      ? 'var(--primary)'
                      : 'var(--gray-light)',
                  }}
                />
              ) : null}
            </Fragment>
          )
        })}
      </div>
      <div className="status-labels-row">
        {STATUS_STEPS.map((step, index) => {
          const isCompleted = index <= currentIndex
          const isActive = index === currentIndex

          return (
            <div
              key={step.id}
              className="status-label"
              style={{
                color: isCompleted ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {step.label}
            </div>
          )
        })}
      </div>
    </div>
  )
}
