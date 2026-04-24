'use client'

import { useCallback } from 'react'
import { Star, Calendar, Briefcase, Clock } from 'lucide-react'
import { formatCurrencyDetailed, cn } from '@/lib/utils'
import {
  MONTHLY_FLEX_ROWS,
  MONTHLY_FLEX_TERMS,
  PROJECT_ROWS,
  calculateOptionPricing,
  deriveSolutionOptions,
  type RabornPricingData,
  type RabornSolution,
  type MonthlyFlexTerm,
  type PricingMode,
} from '@/lib/raborn-pricing'

interface Props {
  value: RabornPricingData
  onChange: (next: RabornPricingData) => void
}

export function RabornPricingEditor({ value, onChange }: Props) {
  const { mode, terms, projectHours, solutions } = value

  const updateMode = useCallback((newMode: PricingMode) => {
    onChange({ ...value, mode: newMode })
  }, [value, onChange])

  const updateTerm = useCallback((idx: 0 | 1, term: MonthlyFlexTerm) => {
    const next: [MonthlyFlexTerm, MonthlyFlexTerm] = [...terms]
    next[idx] = term
    onChange({ ...value, terms: next })
  }, [terms, value, onChange])

  const updateProjectHour = useCallback((idx: 0 | 1, hours: number) => {
    const next: [number, number] = [...projectHours]
    next[idx] = hours
    onChange({ ...value, projectHours: next })
  }, [projectHours, value, onChange])

  const updateSolution = useCallback((idx: number, patch: Partial<RabornSolution>) => {
    const next = solutions.map((s, i) => (i === idx ? { ...s, ...patch } : s))
    if (patch.recommended === true) {
      next.forEach((s, i) => {
        if (i !== idx) s.recommended = false
      })
    }
    onChange({ ...value, solutions: next })
  }, [solutions, value, onChange])

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2.5">
          Pricing Model
        </label>
        <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
          <button
            type="button"
            onClick={() => updateMode('monthly_flex')}
            className={cn(
              'flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium transition-all',
              mode === 'monthly_flex'
                ? 'bg-white text-[#003964] shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <Calendar className="h-4 w-4" />
            Monthly Flex
          </button>
          <button
            type="button"
            onClick={() => updateMode('project')}
            className={cn(
              'flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium transition-all',
              mode === 'project'
                ? 'bg-white text-[#003964] shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <Briefcase className="h-4 w-4" />
            Project
          </button>
        </div>
      </div>

      {/* Global 2-option picker */}
      <div className="rounded-xl border-2 border-[#00CFF8]/40 bg-[#00CFF8]/5 p-5">
        <div className="mb-3">
          <h4 className="text-sm font-bold text-[#003964]">
            {mode === 'monthly_flex' ? 'Commitment Terms Offered' : 'Monthly Hours Offered'}
          </h4>
          <p className="text-xs text-gray-600 mt-0.5">
            Select 2 {mode === 'monthly_flex' ? 'terms' : 'hour levels'} — each solution below will automatically offer both. The client chooses one when signing.
          </p>
        </div>

        {mode === 'monthly_flex' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[0, 1].map((idx) => (
              <div key={idx} className="rounded-lg bg-white border border-gray-200 p-3">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Option {idx === 0 ? 'A' : 'B'}
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {MONTHLY_FLEX_TERMS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => updateTerm(idx as 0 | 1, t)}
                      className={cn(
                        'py-2 rounded-md text-xs font-semibold transition-colors',
                        terms[idx] === t
                          ? 'bg-[#003964] text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      )}
                    >
                      {t}mo
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[0, 1].map((idx) => (
              <div key={idx} className="rounded-lg bg-white border border-gray-200 p-3">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Option {idx === 0 ? 'A' : 'B'}
                </label>
                <select
                  value={projectHours[idx]}
                  onChange={(e) => updateProjectHour(idx as 0 | 1, parseFloat(e.target.value))}
                  className="w-full rounded-md border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-900 focus:border-[#00CFF8] focus:ring-1 focus:ring-[#00CFF8]/20 focus:outline-none"
                >
                  {PROJECT_ROWS.map((r) => (
                    <option key={r.monthlyHours} value={r.monthlyHours}>
                      {r.monthlyHours} hrs/mo · {r.totalHours} total
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Solution Cards */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Solution Tiers
        </label>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {solutions.map((sol, idx) => (
            <SolutionCard
              key={sol.tier}
              solution={sol}
              mode={mode}
              pricingData={{ mode, terms, projectHours }}
              onChange={(patch) => updateSolution(idx, patch)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Solution Card ────────────────────────────────────────────────

function SolutionCard({
  solution,
  mode,
  pricingData,
  onChange,
}: {
  solution: RabornSolution
  mode: PricingMode
  pricingData: Pick<RabornPricingData, 'mode' | 'terms' | 'projectHours'>
  onChange: (patch: Partial<RabornSolution>) => void
}) {
  const derivedOptions = deriveSolutionOptions(solution, pricingData)

  return (
    <div
      className="relative rounded-xl border-2 bg-white overflow-hidden transition-all"
      style={{
        borderColor: solution.recommended ? solution.color : '#E5E7EB',
        boxShadow: solution.recommended ? `0 4px 20px ${solution.color}20` : undefined,
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 text-white"
        style={{ backgroundColor: solution.color }}
      >
        <div className="flex items-start justify-between gap-3">
          <input
            type="text"
            value={solution.name}
            onChange={(e) => onChange({ name: e.target.value })}
            className="flex-1 bg-transparent text-white font-bold text-lg placeholder-white/60 outline-none border-b border-white/30 focus:border-white/70 pb-1"
          />
          <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={solution.recommended}
              onChange={(e) => onChange({ recommended: e.target.checked })}
              className="h-3.5 w-3.5 rounded border-white/50"
            />
            <span className="text-xs font-medium text-white/90 flex items-center gap-1 whitespace-nowrap">
              <Star className="h-3 w-3" /> Recommended
            </span>
          </label>
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
            Description
          </label>
          <textarea
            value={solution.description}
            onChange={(e) => onChange({ description: e.target.value })}
            rows={2}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-[#00CFF8] focus:ring-2 focus:ring-[#00CFF8]/20 focus:outline-none resize-none"
          />
        </div>

        {/* Solution-level hours */}
        {mode === 'monthly_flex' ? (
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
              Monthly Hours
            </label>
            <select
              value={solution.hours}
              onChange={(e) => onChange({ hours: parseInt(e.target.value) })}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#00CFF8] focus:ring-2 focus:ring-[#00CFF8]/20 focus:outline-none"
            >
              {MONTHLY_FLEX_ROWS.map((r) => (
                <option key={r.hours} value={r.hours}>
                  {r.hours} hrs / month
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
              Monthly Hours <span className="text-gray-400 font-normal">(each option will override this from the top)</span>
            </label>
            <select
              value={solution.projectMonthlyHours}
              onChange={(e) => onChange({ projectMonthlyHours: parseFloat(e.target.value) })}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#00CFF8] focus:ring-2 focus:ring-[#00CFF8]/20 focus:outline-none"
            >
              {PROJECT_ROWS.map((r) => (
                <option key={r.monthlyHours} value={r.monthlyHours}>
                  {r.monthlyHours} hrs/mo · {r.totalHours} total
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Live preview of the 2 derived options */}
        <div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
            Client will see these 2 options
          </p>
          <div className="grid grid-cols-2 gap-2">
            {derivedOptions.map((opt) => {
              const pricing = calculateOptionPricing(opt, mode)
              return (
                <div
                  key={opt.id}
                  className="rounded-md px-3 py-2 text-xs space-y-0.5"
                  style={{ backgroundColor: solution.accentBg }}
                >
                  <div className="flex items-center gap-1 font-semibold" style={{ color: solution.accentText }}>
                    <Clock className="h-2.5 w-2.5" />
                    <span>{opt.label}</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[10px] text-gray-500">Monthly</span>
                    <span className="text-sm font-bold" style={{ color: solution.color }}>
                      {formatCurrencyDetailed(pricing.monthlyCost)}
                    </span>
                  </div>
                  {pricing.discount > 0 && (
                    <div className="text-[10px]" style={{ color: solution.accentText }}>
                      {(pricing.discount * 100).toFixed(0)}% off
                    </div>
                  )}
                  <div className="pt-1 mt-1 border-t border-gray-300/50 flex items-baseline justify-between">
                    <span className="text-[10px] font-semibold text-gray-700">Total</span>
                    <span className="text-sm font-bold text-gray-900">
                      {formatCurrencyDetailed(pricing.totalCost)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
