import { DollarSign, Clock, Pen, TrendingUp } from 'lucide-react'
import { StatCard } from '@/components/ui/stat-card'
import { formatCurrency } from '@/lib/utils'

interface MetricsGridProps {
  pipelineValue: number
  pendingApprovals: number
  awaitingSignature: number
  winRate: number
}

export function MetricsGrid({
  pipelineValue,
  pendingApprovals,
  awaitingSignature,
  winRate,
}: MetricsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Total Pipeline Value"
        value={formatCurrency(pipelineValue)}
        icon={<DollarSign className="h-5 w-5 text-green-600" />}
        iconBgColor="bg-green-100"
      />
      <StatCard
        label="Pending Approvals"
        value={String(pendingApprovals)}
        icon={<Clock className="h-5 w-5 text-[#625AED]" />}
        iconBgColor="bg-[#625AED]/10"
      />
      <StatCard
        label="Awaiting Signature"
        value={String(awaitingSignature)}
        icon={<Pen className="h-5 w-5 text-amber-600" />}
        iconBgColor="bg-amber-100"
      />
      <StatCard
        label="Win Rate"
        value={`${winRate}%`}
        icon={<TrendingUp className="h-5 w-5 text-[#00CFF8]" />}
        iconBgColor="bg-[#00CFF8]/10"
      />
    </div>
  )
}
