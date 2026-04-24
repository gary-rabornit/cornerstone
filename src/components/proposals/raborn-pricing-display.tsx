'use client'

import { Check } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import {
  calculateOptionPricing,
  deriveSolutionOptions,
  type RabornPricingData,
  type DerivedOption,
} from '@/lib/raborn-pricing'

interface Props {
  data: RabornPricingData
  accentColor?: string
  primaryColor?: string
  selectedPlanId?: string | null
  onSelectPlan?: (option: DerivedOption, solutionName: string) => void
  readOnly?: boolean
}

export function RabornPricingDisplay({
  data,
  primaryColor = '#003964',
  selectedPlanId,
  onSelectPlan,
  readOnly,
}: Props) {
  const { mode, solutions } = data
  const isSelectable = !readOnly && typeof onSelectPlan === 'function'

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h3 className="text-2xl font-bold" style={{ color: primaryColor }}>Choose Your Plan</h3>
        <p className="text-sm text-gray-500 mt-1">
          {mode === 'monthly_flex'
            ? 'Monthly retainer with flexible hours.'
            : '6-month fixed-scope project engagement.'}
        </p>
        {isSelectable && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md mt-3 px-3 py-1.5 inline-block font-medium">
            Please select one option to continue with signing.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {solutions.map((sol) => {
          const derived = deriveSolutionOptions(sol, data)

          return (
            <div
              key={sol.tier}
              className="rounded-xl border-2 bg-white overflow-hidden flex flex-col"
              style={{
                borderColor: sol.recommended ? sol.color : '#E5E7EB',
                boxShadow: sol.recommended ? `0 4px 24px ${sol.color}25` : undefined,
              }}
            >
              {/* Ribbon */}
              <div
                className="text-xs font-bold text-white text-center uppercase tracking-wider flex items-center justify-center"
                style={{
                  backgroundColor: sol.recommended ? sol.color : 'transparent',
                  height: '28px',
                }}
              >
                {sol.recommended ? '★ Recommended' : ''}
              </div>

              {/* Header */}
              <div
                className="px-5 text-center flex items-center justify-center"
                style={{
                  backgroundColor: `${sol.color}10`,
                  height: '64px',
                }}
              >
                <h4 className="text-lg font-bold" style={{ color: sol.color }}>
                  {sol.name}
                </h4>
              </div>

              {/* Description */}
              <div
                className="px-5 border-b border-gray-100 flex items-center justify-center"
                style={{ height: '120px' }}
              >
                <p className="text-sm text-gray-600 text-center leading-relaxed">
                  {sol.description}
                </p>
              </div>

              {/* Options */}
              <div className="p-4 space-y-8 flex-1 flex flex-col">
                {isSelectable && (
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">
                    Select an option
                  </p>
                )}
                {derived.map((option) => {
                  const pricing = calculateOptionPricing(option, mode)
                  const isSelected = selectedPlanId === option.id

                  return (
                    <OptionCard
                      key={option.id}
                      option={option}
                      label={option.label}
                      agreementLabel={pricing.agreementLabel}
                      hoursLabel={pricing.hoursLabel}
                      monthlyCost={pricing.monthlyCost}
                      totalCost={pricing.totalCost}
                      discount={pricing.discount}
                      savings={pricing.savings}
                      color={sol.color}
                      accentBg={sol.accentBg}
                      accentText={sol.accentText}
                      isSelectable={isSelectable}
                      isSelected={isSelected}
                      onSelect={() => onSelectPlan?.(option, sol.name)}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-xs text-center text-gray-400 pt-2">
        {mode === 'monthly_flex'
          ? 'Monthly Flex pricing. Hours roll over within each commitment period.'
          : 'Project pricing. All hours delivered across a 6-month engagement.'}
      </p>
    </div>
  )
}

// ── Single option card ───────────────────────────────────

interface OptionCardProps {
  option: DerivedOption
  label: string
  agreementLabel: string
  hoursLabel: string
  monthlyCost: number
  totalCost: number
  discount: number
  savings: number
  color: string
  accentBg: string
  accentText: string
  isSelectable: boolean
  isSelected: boolean
  onSelect: () => void
}

function OptionCard({
  label,
  agreementLabel,
  hoursLabel,
  monthlyCost,
  totalCost,
  discount,
  savings,
  color,
  accentBg,
  accentText,
  isSelectable,
  isSelected,
  onSelect,
}: OptionCardProps) {
  const borderStyle = isSelectable
    ? {
        borderColor: isSelected ? color : '#E5E7EB',
        boxShadow: isSelected ? `0 0 0 2px ${color}` : undefined,
      }
    : { borderColor: '#E5E7EB' }

  const Tag = isSelectable ? 'button' : 'div'

  return (
    <Tag
      type={isSelectable ? 'button' : undefined}
      onClick={isSelectable ? onSelect : undefined}
      className={`w-full rounded-lg border-2 overflow-hidden text-left transition-all flex flex-col ${
        isSelectable ? 'cursor-pointer hover:shadow-md' : ''
      }`}
      style={borderStyle}
    >
      {/* Option label + radio — fixed 48px */}
      <div
        className="relative px-3 flex items-center justify-center border-b border-gray-100 bg-white"
        style={{ height: '48px' }}
      >
        <span className="text-lg font-bold" style={{ color }}>{label}</span>
        {isSelectable && (
          <span
            className="absolute right-3 h-4 w-4 rounded-full border-2 flex items-center justify-center transition-colors"
            style={{
              borderColor: isSelected ? color : '#D1D5DB',
              backgroundColor: isSelected ? color : 'transparent',
            }}
          >
            {isSelected && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
          </span>
        )}
      </div>

      {/* Agreement info — fixed 56px */}
      <div
        className="px-3 text-white text-center flex flex-col justify-center"
        style={{ backgroundColor: color, height: '56px' }}
      >
        <p className="text-[10px] font-semibold opacity-90 uppercase tracking-wider">
          {agreementLabel}
        </p>
        <p className="text-xs font-medium opacity-95 mt-0.5">{hoursLabel}</p>
      </div>

      {/* Discount highlight banner — fixed 48px, always rendered for alignment */}
      <div
        className="px-3 text-center flex flex-col justify-center border-y-2"
        style={{
          backgroundColor: discount > 0 ? `${color}` : '#F9FAFB',
          borderColor: discount > 0 ? `${color}80` : '#F3F4F6',
          height: '48px',
          color: discount > 0 ? '#FFFFFF' : '#9CA3AF',
        }}
      >
        {discount > 0 ? (
          <>
            <p className="text-sm font-extrabold leading-none tracking-tight">
              {(discount * 100).toFixed(0)}% DISCOUNT
            </p>
            {savings > 0 && (
              <p className="text-[10px] font-semibold mt-1 opacity-95">
                Save {formatCurrency(savings)}
              </p>
            )}
          </>
        ) : (
          <p className="text-[10px] font-medium">No discount on this term</p>
        )}
      </div>

      {/* Total Monthly Price — the featured metric, fixed 72px */}
      <div
        className="px-3 text-center flex flex-col justify-center mt-auto"
        style={{ backgroundColor: accentBg, height: '72px' }}
      >
        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: accentText }}>
          Total Monthly Price
        </p>
        <p className="text-xl font-bold mt-0.5" style={{ color }}>
          {formatCurrency(monthlyCost)}
          <span className="text-xs font-normal text-gray-500">/mo</span>
        </p>
      </div>
    </Tag>
  )
}
