'use client'

import { formatCurrency } from '@/lib/utils'
import { COMPANY_OPTIONS, type CompanyKey } from '@/lib/companies'
import { CompanyLogo } from '@/components/ui/company-logo'

interface CompanyStats {
  company: CompanyKey
  pipelineValue: number
  dealCount: number
  winRate: number
}

interface CompanyBreakdownProps {
  stats: CompanyStats[]
}

export function CompanyBreakdown({ stats }: CompanyBreakdownProps) {
  const maxValue = Math.max(...stats.map((s) => s.pipelineValue), 1)

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-[#1A202C]">
          Pipeline by Company
        </h3>
      </div>
      <div className="space-y-3 p-4">
        {stats.map((stat) => {
          const co = COMPANY_OPTIONS.find((c) => c.key === stat.company)
          if (!co) return null
          const barWidth = maxValue > 0 ? (stat.pipelineValue / maxValue) * 100 : 0

          return (
            <div
              key={stat.company}
              className="rounded-lg border px-5 py-4"
              style={{
                borderColor: `${co.primaryColor}50`,
                backgroundColor: `${co.primaryColor}2E`,
                borderLeftWidth: '4px',
                borderLeftColor: co.primaryColor,
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <CompanyLogo companyKey={co.key} size="lg" className="scale-90 origin-left" />
                </div>
                <span className="text-xl font-bold" style={{ color: co.primaryColor }}>
                  {formatCurrency(stat.pipelineValue)}
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-2.5 rounded-full mb-3" style={{ backgroundColor: `${co.primaryColor}15` }}>
                <div
                  className="h-2.5 rounded-full transition-all"
                  style={{
                    width: `${Math.max(barWidth, 2)}%`,
                    background: `linear-gradient(90deg, ${co.primaryColor}, ${co.accentColor})`,
                  }}
                />
              </div>

              <div className="flex items-center gap-4 text-xs">
                <span className="text-gray-500">
                  <span className="font-semibold" style={{ color: co.primaryColor }}>{stat.dealCount}</span>{' '}
                  {stat.dealCount === 1 ? 'deal' : 'deals'}
                </span>
                <span className="text-gray-500">
                  <span className="font-semibold" style={{ color: co.primaryColor }}>{stat.winRate}%</span>{' '}
                  win rate
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
