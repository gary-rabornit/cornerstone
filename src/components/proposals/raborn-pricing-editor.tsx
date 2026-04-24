'use client'

import { useCallback } from 'react'
import { Star, Calendar, Briefcase, Clock } from 'lucide-react'
import { formatCurrencyDetailed, cn } from '@/lib/utils'
import {
  MONTHLY_FLEX_ROWS,
  MONTHLY_FLEX_TERMS,
  PROJECT_ROWS,
  lookupMonthlyFlex,
  lookupProject,
  DEFAULT_SOLUTIONS,
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
  const { mode, solutions } = value

  const updateMode = useCallback((newMode: PricingMode) => {
    onChange({ ...value, mode: newMode })
  }, [value, onChange])

  const updateSolution = useCallback((idx: number, patch: Partial<RabornSolution>) => {
    const next = solutions.map((s, i) => (i === idx ? { ...s, ...patch } : s))
    // If recommended is being set to true, clear other recommendations
    if (patch.recommended === true) {
      next.forEach((s, i) => {
        if (i !== idx) s.recommended = false
      })
    }
    onChange({ ...value, solutions: next })
  }, [solutions, value, onChange])

  const resetToDefaults = useCallback(() => {
    onChange({ ...value, solutions: DEFAULT_SOLUTIONS })
  }, [value, onChange])

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
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-semibold text-gray-700">
            Solution Tiers
          </label>
          <button
            type="button"
            onClick={resetToDefaults}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Reset to defaults
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {solutions.map((sol, idx) => (
            <SolutionCard
              key={sol.tier}
              solution={sol}
              mode={mode}
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
  onChange,
}: {
  solution: RabornSolution
  mode: PricingMode
  onChange: (patch: Partial<RabornSolution>) => void
}) {
  // Calculate pricing info based on mode
  const flexRow = lookupMonthlyFlex(solution.hours)
  const projectRow = lookupProject(solution.projectMonthlyHours)

  const monthlyCost = mode === 'monthly_flex'
    ? flexRow?.monthly[solution.term] ?? 0
    : projectRow?.monthlyCost ?? 0

  const discount = mode === 'monthly_flex'
    ? flexRow?.discount[solution.term] ?? 0
    : projectRow?.discount ?? 0

  const totalCost = mode === 'monthly_flex'
    ? monthlyCost * solution.term
    : projectRow?.totalCost ?? 0

  // Savings vs no-discount baseline
  const fullPrice = mode === 'monthly_flex'
    ? (flexRow?.monthly[3] ?? 0) * solution.term
    : (projectRow ? projectRow.monthlyCost / (1 - projectRow.discount) * 6 : 0)
  const savings = Math.max(0, fullPrice - totalCost)

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
        className="px-5 py-4 text-white relative"
        style={{ backgroundColor: solution.color }}
      >
        <input
          type="text"
          value={solution.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className="w-full bg-transparent text-white font-bold text-base placeholder-white/60 outline-none border-b border-white/30 focus:border-white/70 pb-1"
        />
        <label className="flex items-center gap-1.5 mt-2 cursor-pointer">
          <input
            type="checkbox"
            checked={solution.recommended}
            onChange={(e) => onChange({ recommended: e.target.checked })}
            className="h-3.5 w-3.5 rounded border-white/50"
          />
          <span className="text-xs font-medium text-white/90 flex items-center gap-1">
            <Star className="h-3 w-3" /> Mark as recommended
          </span>
        </label>
      </div>

      {/* Body */}
      <div className="px-5 py-4 space-y-4">
        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
            Description
          </label>
          <textarea
            value={solution.description}
            onChange={(e) => onChange({ description: e.target.value })}
            rows={3}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-[#00CFF8] focus:ring-2 focus:ring-[#00CFF8]/20 focus:outline-none resize-none"
          />
        </div>

        {/* Hours picker */}
        {mode === 'monthly_flex' ? (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                Monthly Hours
              </label>
              <select
                value={solution.hours}
                onChange={(e) => onChange({ hours: parseInt(e.target.value) })}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#00CFF8] focus:ring-2 focus:ring-[#00CFF8]/20 focus:outline-none"
              >
                {MONTHLY_FLEX_ROWS.map(r => (
                  <option key={r.hours} value={r.hours}>{r.hours} hrs / month</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                Commitment Term
              </label>
              <div className="grid grid-cols-4 gap-1">
                {MONTHLY_FLEX_TERMS.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => onChange({ term: t as MonthlyFlexTerm })}
                    className={cn(
                      'py-2 rounded-md text-xs font-semibold transition-colors',
                      solution.term === t
                        ? 'text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    )}
                    style={solution.term === t ? { backgroundColor: solution.color } : undefined}
                  >
                    {t} mo
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
              Monthly Hours <span className="text-gray-400 font-normal">(over 6 months)</span>
            </label>
            <select
              value={solution.projectMonthlyHours}
              onChange={(e) => onChange({ projectMonthlyHours: parseFloat(e.target.value) })}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#00CFF8] focus:ring-2 focus:ring-[#00CFF8]/20 focus:outline-none"
            >
              {PROJECT_ROWS.map(r => (
                <option key={r.monthlyHours} value={r.monthlyHours}>
                  {r.monthlyHours} hrs/mo · {r.totalHours} total hrs
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Pricing display */}
        <div
          className="rounded-lg px-4 py-3 space-y-1.5"
          style={{ backgroundColor: solution.accentBg }}
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: solution.accentText }}>
            <Clock className="h-3 w-3" />
            <span>
              {mode === 'monthly_flex'
                ? `${solution.term}-month agreement · ${solution.hours} hrs/mo`
                : `6-month project · ${projectRow?.totalHours ?? 0} total hrs`}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-gray-500">Monthly cost</span>
            <span className="text-xl font-bold" style={{ color: solution.color }}>
              {formatCurrencyDetailed(monthlyCost)}
              <span className="text-xs text-gray-400 font-normal">/mo</span>
            </span>
          </div>
          {discount > 0 && (
            <div className="text-xs" style={{ color: solution.accentText }}>
              {(discount * 100).toFixed(0)}% discount
              {savings > 0 && (
                <span className="text-gray-400 font-normal"> · {formatCurrencyDetailed(savings)} savings</span>
              )}
            </div>
          )}
          <div className="pt-2 mt-1 border-t border-gray-200 flex items-baseline justify-between">
            <span className="text-xs font-semibold text-gray-700">Total</span>
            <span className="text-lg font-bold text-gray-900">
              {formatCurrencyDetailed(totalCost)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
