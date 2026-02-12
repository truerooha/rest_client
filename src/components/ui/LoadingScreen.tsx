 'use client'

import React from 'react'
import { LoadingSpinner } from './LoadingSpinner'

export function LoadingScreen() {
  return (
    <div className="splash-screen" role="status" aria-live="polite" aria-busy="true">
      <div className="splash-inner">
        <div className="splash-logo" aria-hidden>
          <div className="splash-logo-mark">🚚</div>
        </div>

        <div className="splash-copy">
          <div className="splash-title">Обед в Офис</div>
          <div className="splash-subtitle">Подгружаем данные, скоро всё будет готово</div>
        </div>

        <div className="splash-spinner" aria-hidden>
          <LoadingSpinner size="lg" />
        </div>
      </div>
    </div>
  )
}

