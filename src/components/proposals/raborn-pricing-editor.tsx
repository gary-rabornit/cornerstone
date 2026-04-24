'use client'

import { useCallback } from 'react'
import { Star, Calendar, Briefcase, Clock } from 'lucide-react'
import { formatCurrencyDetailed, cn } from '@/lib/utils'
import {
  MONTHLY_FLEX_ROWS,
  MONTHLY_FLEX_TERMS,
  PROJECT_ROWS,
  calculateOptionPricing,
  type RabornPricingData,
  type RabornSolution,
  type RabornSolutionOption,
  type MonthlyFlexTerm,
  type PricingMode,
} from '@/lib/raborn-pricing'

interface Props {
  value: RabornPricingData
  onChange: (next: RabornPricingData) => void
}

export function RabornPricingEditor({ value, onChange }: Props) {
  const { mode, solutions } = value

  const updateMode = useCallback((newMode: PricingMode) => {
    onChange({ ...value, mode: newMode })
  }, [value, onChange])

  const updateSolution = useCallback((idx: number, patch: Partial<RabornSolution>) => {
    const next = solutions.map((s, i) => (i === idx ? { ...s, ...patch } : s))
    if (patch.recommended === true) {
      next.forEach((s, i) => {
        if (i !== idx) s.recommended = false
      })
    }
    onChange({ ...value, solutions: next })
  }, [solutions, value, onChange])

  const updateOption = useCallback((solIdx: number, optIdx: number, patch: Partial<RabornSolutionOption>) => {
    const next = solutions.map((s, i) => {
      if (i !== solIdx) return s
      const newOptions = s.options.map((o, j) => (j === optIdx ? { ...o, ...patch } : o))
      return { ...s, options: newOptions }
    })
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
        <p className="text-xs text-gray-500 mt-2">
          {mode === 'monthly_flex'
            ? 'Ongoing monthly retainer with flexible hour commitments.'
            : 'Fixed-scope project billed over 6 months.'}
        </p>
      </div>

      {/* Solution Cards */}
      <div>
        <div className="mb-3">
          <label className="block text-sm font-semibold text-gray-700">
            Solution Tiers
          </label>
          <p className="text-xs text-gray-500 mt-0.5">
            Each tier offers 2 options. The client will choose one when signing.
          </p>
        </div>

        <div className="space-y-5">
          {solutions.map((sol, idx) => (
            <SolutionCard
              key={sol.tier}
              solution={sol}
              mode={mode}
              onChange={(patch) => updateSolution(idx, patch)}
              onOptionChange={(optIdx, patch) => updateOption(idx, optIdx, patch)}
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
  onChange,
  onOptionChange,
}: {
  solution: RabornSolution
  mode: PricingMode
  onChange: (patch: Partial<RabornSolution>) => void
  onOptionChange: (optIdx: number, patch: Partial<RabornSolutionOption>) => void
}) {
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

        {/* Two option editors side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {solution.options.map((option, optIdx) => (
            <OptionEditor
              key={option.id}
              option={option}
              mode={mode}
              solutionColor={solution.color}
              accentBg={solution.accentBg}
              accentText={solution.accentText}
              onChange={(patch) => onOptionChange(optIdx, patch)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Option Editor (one of two per solution) ────────────────────────

function OptionEditor({
  option,
  mode,
  solutionColor,
  accentBg,
  accentText,
  onChange,
}: {
  option: RabornSolutionOption
  mode: PricingMode
  solutionColor: string
  accentBg: string
  accentText: string
  onChange: (patch: Partial<RabornSolutionOption>) => void
}) {
  const pricing = calculateOptionPricing(option, mode)

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-3 space-y-3">
      {/* Label */}
      <input
        type="text"
        value={option.label}
        onChange={(e) => onChange({ label: e.target.value })}
        className="w-full bg-white rounded-md border border-gray-200 px-2 py-1 text-sm font-semibold focus:border-[#00CFF8] focus:ring-1 focus:ring-[#00CFF8]/20 focus:outline-none"
        style={{ color: solutionColor }}
      />

      {/* Hours picker */}
      {mode === 'monthly_flex' ? (
        <>
          <div>
            <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1">
              Monthly Hours
            </label>
            <select
              value={option.hours}
              onChange={(e) => onChange({ hours: parseInt(e.target.value) })}
              className="w-full rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-900 focus:border-[#00CFF8] focus:ring-1 focus:ring-[#00CFF8]/20 focus:outline-none"
            >
              {MONTHLY_FLEX_ROWS.map(r => (
                <option key={r.hours} value={r.hours}>{r.hours} hrs/mo</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1">
              Commitment
            </label>
            <div className="grid grid-cols-4 gap-1">
              {MONTHLY_FLEX_TERMS.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => onChange({ term: t as MonthlyFlexTerm })}
                  className={cn(
                    'py-1 rounded-md text-[10px] font-semibold transition-colors',
                    option.term === t
                      ? 'text-white shadow-sm'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                  )}
                  style={option.term === t ? { backgroundColor: solutionColor } : undefined}
                >
                  {t}mo
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div>
          <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1">
            Monthly Hours (over 6 months)
          </label>
          <select
            value={option.projectMonthlyHours}
            onChange={(e) => onChange({ projectMonthlyHours: parseFloat(e.target.value) })}
            className="w-full rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-900 focus:border-[#00CFF8] focus:ring-1 focus:ring-[#00CFF8]/20 focus:outline-none"
          >
            {PROJECT_ROWS.map(r => (
              <option key={r.monthlyHours} value={r.monthlyHours}>
                {r.monthlyHours} hrs/mo · {r.totalHours} total
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Pricing summary */}
      <div
        className="rounded-md px-3 py-2 space-y-0.5"
        style={{ backgroundColor: accentBg }}
      >
        <div className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: accentText }}>
          <Clock className="h-2.5 w-2.5" />
          <span>{pricing.agreementLabel}</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-[10px] text-gray-500">Monthly</span>
          <span className="text-base font-bold" style={{ color: solutionColor }}>
            {formatCurrencyDetailed(pricing.monthlyCost)}
          </span>
        </div>
        {pricing.discount > 0 && (
          <div className="text-[10px]" style={{ color: accentText }}>
            {(pricing.discount * 100).toFixed(0)}% off · {formatCurrencyDetailed(pricing.savings)} saved
          </div>
        )}
        <div className="pt-1 mt-1 border-t border-gray-200 flex items-baseline justify-between">
          <span className="text-[10px] font-semibold text-gray-700">Total</span>
          <span className="text-sm font-bold text-gray-900">
            {formatCurrencyDetailed(pricing.totalCost)}
          </span>
        </div>
      </div>
    </div>
  )
}
