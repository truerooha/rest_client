'use client'

import React from 'react'
import { LoadingSpinner } from './LoadingSpinner'

export function LoadingScreen() {
  return (
    <div className="splash-screen" role="status" aria-live="polite" aria-busy="true">
      <div className="splash-inner-brand">
        <div className="splash-brand-block">
          <img
            src="/images/logo.png"
            alt="Kuskus"
            className="splash-logo-img"
            width={240}
            height={154}
          />

          <div className="splash-delivery-chip">delivery</div>
        </div>

        <div className="splash-tagline">Вкусные обеды уже в пути</div>

        <div className="splash-spinner" aria-hidden>
          <LoadingSpinner size="md" />
        </div>
      </div>
    </div>
  )
}
