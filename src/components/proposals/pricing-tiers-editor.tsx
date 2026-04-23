'use client'

import { useCallback } from 'react'
import { cn, formatCurrencyDetailed } from '@/lib/utils'
import { Star } from 'lucide-react'
import type { PricingTier } from '@/types'

const TIER_COLORS = [
  { header: 'bg-orange-500', border: 'border-orange-500', accent: 'text-orange-600' },
  { header: 'bg-teal-500', border: 'border-teal-500', accent: 'text-teal-600' },
  { header: 'bg-[#003964]', border: 'border-[#003964]', accent: 'text-[#003964]' },
]

export const DEFAULT_PRICING_TIERS: PricingTier[] = [
  {
    id: 'tier-focused',
    name: 'Focused Solution',
    description: '',
    hours: 40,
    monthlyCost: 5000,
    months: 6,
    discount: 0,
    totalCost: 30000,
    recommended: false,
  },
  {
    id: 'tier-recommended',
    name: 'Recommended Solution',
    description: '',
    hours: 80,
    monthlyCost: 9000,
    months: 6,
    discount: 0,
    totalCost: 54000,
    recommended: true,
  },
  {
    id: 'tier-expanded',
    name: 'Expanded Solution',
    description: '',
    hours: 120,
    monthlyCost: 13000,
    months: 6,
    discount: 0,
    totalCost: 78000,
    recommended: false,
  },
]

interface PricingTiersEditorProps {
  tiers: PricingTier[]
  onChange: (tiers: PricingTier[]) => void
}

function calcTotal(tier: PricingTier): number {
  const gross = tier.monthlyCost * tier.months
  const discountAmount = gross * (tier.discount / 100)
  return gross - discountAmount
}

export function PricingTiersEditor({ tiers, onChange }: PricingTiersEditorProps) {
  const updateTier = useCallback(
    (id: string, field: keyof PricingTier, value: string | number | boolean) => {
      const updated = tiers.map((tier) => {
        if (tier.id !== id) {
          // If setting recommended on another tier, clear it
          if (field === 'recommended' && value === true) {
            return { ...tier, recommended: false }
          }
          return tier
        }
        const patched = { ...tier, [field]: value }
        patched.totalCost = calcTotal(patched)
        return patched
      })
      onChange(updated)
    },
    [tiers, onChange]
  )

  const inputClass =
    'w-full rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-900 focus:border-[#00CFF8] focus:outline-none focus:ring-1 focus:ring-[#00CFF8]'

  return (
    <div className="grid grid-cols-3 gap-5">
      {tiers.map((tier, index) => {
        const color = TIER_COLORS[index] || TIER_COLORS[0]
        return (
          <div
            key={tier.id}
            className={cn(
              'rounded-xl border-2 bg-white overflow-hidden shadow-sm transition-all',
              tier.recommended
                ? 'border-teal-400 ring-2 ring-teal-200'
                : 'border-gray-200'
            )}
          >
            {/* Header */}
            <div className={cn('px-5 py-4 text-white', color.header)}>
              <input
                type="text"
                value={tier.name}
                onChange={(e) => updateTier(tier.id, 'name', e.target.value)}
                className="w-full bg-transparent text-white font-semibold text-lg placeholder:text-white/60 focus:outline-none"
                placeholder="Tier Name"
              />
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Description
                </label>
                <textarea
                  value={tier.description}
                  onChange={(e) => updateTier(tier.id, 'description', e.target.value)}
                  placeholder="Describe what this tier includes..."
                  rows={3}
                  className={cn(inputClass, 'resize-y')}
                />
              </div>

              {/* Agreement Length */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Agreement Length (months)
                </label>
                <input
                  type="number"
                  min={1}
                  value={tier.months}
                  onChange={(e) =>
                    updateTier(tier.id, 'months', parseInt(e.target.value) || 1)
                  }
                  className={inputClass}
                />
              </div>

              {/* Hours */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Hours / Month
                </label>
                <input
                  type="number"
                  min={0}
                  value={tier.hours}
                  onChange={(e) =>
                    updateTier(tier.id, 'hours', parseFloat(e.target.value) || 0)
                  }
                  className={inputClass}
                />
              </div>

              {/* Monthly Cost */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Monthly Cost ($)
                </label>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={tier.monthlyCost}
                  onChange={(e) =>
                    updateTier(tier.id, 'monthlyCost', parseFloat(e.target.value) || 0)
                  }
                  className={inputClass}
                />
              </div>

              {/* Discount */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Discount (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  value={tier.discount}
                  onChange={(e) =>
                    updateTier(tier.id, 'discount', parseFloat(e.target.value) || 0)
                  }
                  className={inputClass}
                />
              </div>

              {/* Total Cost (read-only) */}
              <div className="rounded-lg bg-gray-50 p-3 border border-gray-100">
                <div className="text-xs font-medium text-gray-500 mb-0.5">
                  Total Cost
                </div>
                <div className={cn('text-2xl font-bold', color.accent)}>
                  {formatCurrencyDetailed(tier.totalCost)}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {formatCurrencyDetailed(tier.monthlyCost)} x {tier.months} mo
                  {tier.discount > 0 && ` - ${tier.discount}%`}
                </div>
              </div>

              {/* Recommended Toggle */}
              <button
                type="button"
                onClick={() => updateTier(tier.id, 'recommended', !tier.recommended)}
                className={cn(
                  'w-full flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all',
                  tier.recommended
                    ? 'border-teal-400 bg-teal-50 text-teal-700'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                )}
              >
                <Star
                  className={cn(
                    'h-4 w-4',
                    tier.recommended ? 'fill-teal-500 text-teal-500' : ''
                  )}
                />
                {tier.recommended ? 'Recommended' : 'Set as Recommended'}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
