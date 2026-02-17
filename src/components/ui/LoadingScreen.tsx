'use client'

import React from 'react'
import { LoadingSpinner } from './LoadingSpinner'

function BrandMark() {
  return (
    <svg
      width="96"
      height="96"
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="splash-brand-mark"
      aria-hidden
    >
      {/* Bowl body */}
      <ellipse cx="48" cy="58" rx="36" ry="24" fill="#158A52" />
      <ellipse cx="48" cy="54" rx="36" ry="20" fill="#DCEFE2" />
      {/* Grain dots — couscous texture */}
      <circle cx="32" cy="50" r="3.5" fill="#F2A23A" opacity="0.9" />
      <circle cx="42" cy="46" r="3" fill="#F2A23A" opacity="0.8" />
      <circle cx="54" cy="48" r="3.5" fill="#F2A23A" opacity="0.9" />
      <circle cx="63" cy="52" r="3" fill="#F2A23A" opacity="0.7" />
      <circle cx="37" cy="56" r="2.5" fill="#F2A23A" opacity="0.6" />
      <circle cx="48" cy="54" r="2.5" fill="#F2A23A" opacity="0.75" />
      <circle cx="57" cy="56" r="2" fill="#F2A23A" opacity="0.65" />
      {/* Steam lines */}
      <path
        d="M36 36 Q38 30 36 24"
        stroke="#158A52"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
      />
      <path
        d="M48 32 Q50 26 48 20"
        stroke="#158A52"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
      <path
        d="M60 36 Q62 30 60 24"
        stroke="#158A52"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
      />
    </svg>
  )
}

export function LoadingScreen() {
  return (
    <div className="splash-screen" role="status" aria-live="polite" aria-busy="true">
      <div className="splash-inner-brand">
        <div className="splash-brand-block">
          <BrandMark />

          <div className="splash-logo-text">
            <span className="splash-logo-kus">Кус</span>
            <span className="splash-logo-dot" aria-hidden>·</span>
            <span className="splash-logo-kus">Кус</span>
          </div>

          <div className="splash-delivery-chip">delivery</div>
        </div>

        <div className="splash-tagline">Вкусные обеды уже в пути к вам</div>

        <div className="splash-spinner" aria-hidden>
          <LoadingSpinner size="md" />
        </div>
      </div>
    </div>
  )
}
