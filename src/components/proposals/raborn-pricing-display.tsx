/* eslint-disable @next/next/no-img-element */
import { formatCurrencyDetailed } from '@/lib/utils'
import { lookupMonthlyFlex, lookupProject, type RabornPricingData } from '@/lib/raborn-pricing'

interface Props {
  data: RabornPricingData
  accentColor?: string
  primaryColor?: string
}

/**
 * Read-only display of Raborn pricing — used in the preview and client-facing views.
 */
export function RabornPricingDisplay({
  data,
  accentColor = '#00CFF8',
  primaryColor = '#003964',
}: Props) {
  const { mode, solutions } = data

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h3 className="text-2xl font-bold" style={{ color: primaryColor }}>Choose Your Plan</h3>
        <p className="text-sm text-gray-500 mt-1">
          {mode === 'monthly_flex'
            ? 'Monthly retainer with flexible hours.'
            : '6-month fixed-scope project engagement.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {solutions.map((sol) => {
          const flexRow = lookupMonthlyFlex(sol.hours)
          const projectRow = lookupProject(sol.projectMonthlyHours)

          const monthlyCost = mode === 'monthly_flex'
            ? flexRow?.monthly[sol.term] ?? 0
            : projectRow?.monthlyCost ?? 0

          const discount = mode === 'monthly_flex'
            ? flexRow?.discount[sol.term] ?? 0
            : projectRow?.discount ?? 0

          const totalCost = mode === 'monthly_flex'
            ? monthlyCost * sol.term
            : projectRow?.totalCost ?? 0

          const fullPrice = mode === 'monthly_flex'
            ? (flexRow?.monthly[3] ?? 0) * sol.term
            : (projectRow ? projectRow.monthlyCost / Math.max(1 - projectRow.discount, 0.0001) * 6 : 0)
          const savings = Math.max(0, fullPrice - totalCost)

          return (
            <div
              key={sol.tier}
              className="rounded-xl border-2 bg-white overflow-hidden flex flex-col"
              style={{
                borderColor: sol.recommended ? sol.color : '#E5E7EB',
                boxShadow: sol.recommended ? `0 4px 24px ${sol.color}25` : undefined,
              }}
            >
              {sol.recommended && (
                <div
                  className="text-xs font-bold text-white text-center py-1.5 uppercase tracking-wider"
                  style={{ backgroundColor: sol.color }}
                >
                  ★ Recommended
                </div>
              )}

              {/* Header with tier name */}
              <div
                className="px-5 py-4 text-center"
                style={{ backgroundColor: `${sol.color}10` }}
              >
                <h4 className="text-lg font-bold" style={{ color: sol.color }}>
                  {sol.name}
                </h4>
              </div>

              {/* Description */}
              <div className="px-5 py-4 border-b border-gray-100">
                <p className="text-sm text-gray-600 text-center leading-relaxed min-h-[3em]">
                  {sol.description}
                </p>
              </div>

              {/* Engagement details */}
              <div
                className="px-5 py-4 text-white text-center"
                style={{ backgroundColor: sol.color }}
              >
                <p className="text-xs font-semibold opacity-90 uppercase tracking-wider">
                  {mode === 'monthly_flex'
                    ? `${sol.term}-Month Agreement`
                    : '6-Month Agreement'}
                </p>
                <p className="text-sm font-medium mt-1 opacity-95">
                  {mode === 'monthly_flex'
                    ? `${sol.hours} Hours / month`
                    : `${projectRow?.totalHours ?? 0} Total Hours`}
                </p>
                <p className="text-3xl font-bold mt-3">
                  {formatCurrencyDetailed(monthlyCost)}
                  <span className="text-base font-normal opacity-80">/mo</span>
                </p>
                {discount > 0 && (
                  <p className="text-xs mt-1 opacity-90">
                    {(discount * 100).toFixed(0)}% Discount
                    {savings > 0 && ` · ${formatCurrencyDetailed(savings)} Savings`}
                  </p>
                )}
              </div>

              {/* Total Cost */}
              <div className="px-5 py-5 bg-gray-50 text-center mt-auto">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Cost</p>
                <p className="text-2xl font-bold mt-1" style={{ color: primaryColor }}>
                  {formatCurrencyDetailed(totalCost)}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer note */}
      <p className="text-xs text-center text-gray-400 pt-2">
        {mode === 'monthly_flex'
          ? 'Monthly Flex pricing. Hours roll over within each commitment period.'
          : 'Project pricing. All hours delivered across a 6-month engagement.'}
      </p>
    </div>
  )
}
